import { BaseService } from '../../common/core/baseService'
import { ChatModel } from './chatModel'
import { Chat } from './chatInterface'
import { DEFAULT_PAGINATION_OPTIONS, PaginatedResponse } from '../../common/interfaces/globalInterfaces';
import mongoose, { isValidObjectId } from 'mongoose';
import { AppError } from '../../common/utils/appError';
import { buildPaginationMeta, getPaginationParams } from '../../common/utils/helpers';

export class ChatService extends BaseService<Chat> {
  constructor() {
    super(ChatModel.getInstance())
  }

  public async createChat(participants: string[], createdBy: string): Promise<Chat> {
    // Validate participants array
    if (!participants || participants.length !== 2) {
      throw AppError.badRequest('Chat must have exactly 2 participants');
    }

    // Check if creator is one of the participants
    if (!participants.includes(createdBy)) {
      throw AppError.badRequest('Creator must be one of the participants');
    }

    // Get the other participant
    const otherParticipant = participants.find(id => id !== createdBy);
    if (!otherParticipant) {
      throw AppError.badRequest('Invalid participants');
    }

    // Check if chat already exists between these participants
    const existingChat = await this.findExistingChat(participants);
    if (existingChat) {
      return existingChat;
    }

    // Create new chat
    const chatData = {
      participants,
      createdBy,
    };

    return await this.create(chatData);
  }

  private async findExistingChat(participants: string[]): Promise<Chat | null> {
    const participantObjectIds = participants.map(id => new mongoose.Types.ObjectId(id));

    const existingChat = await this.model.getMongooseModel()?.findOne({
      participants: {
        $all: participantObjectIds,
        $size: 2
      },
      deletedAt: null
    });

    return existingChat;
  }

  public async getAllChats(params: any = {}): Promise<Chat[] | PaginatedResponse<Chat>> {
    const userObjectId = new mongoose.Types.ObjectId(params.userId);

    const page = params.page || DEFAULT_PAGINATION_OPTIONS.page;
    const perPage = params.perPage || params.per_page || DEFAULT_PAGINATION_OPTIONS.perPage;
    const paginate = params.paginate === 'true' || params.paginate === true;

    const pipeline: any[] = [
      {
        $match: {
          participants: { $in: [userObjectId] },
          deletedAt: null
        },
      },
      {
        $lookup: {
          from: 'users',
          let: { participants: '$participants' },
          pipeline: [
            { $match: { $expr: { $in: ['$_id', '$$participants'] } } },
            {
              $lookup: {
                from: 'uploads',
                localField: 'profilePicture',
                foreignField: '_id',
                as: 'profilePictureData'
              }
            },
            {
              $addFields: {
                profilePicture: {
                  $cond: {
                    if: { $gt: [{ $size: '$profilePictureData' }, 0] },
                    then: { $arrayElemAt: ['$profilePictureData.url', 0] },
                    else: null
                  }
                }
              }
            },
            {
              $project: {
                _id: 1,
                name: 1,
                email: 1,
                profilePicture: 1
              }
            },
          ],
          as: 'users',
        },
      },
      {
        $lookup: {
          from: 'messages',
          localField: 'lastMessage',
          foreignField: '_id',
          pipeline: [
            { $project: { __v: 0, chatId: 0 } },
            {
              $lookup: {
                from: 'users',
                localField: 'sender',
                foreignField: '_id',
                as: 'sender',
                pipeline: [
                  {
                    $lookup: {
                      from: 'uploads',
                      localField: 'profilePicture',
                      foreignField: '_id',
                      as: 'profilePictureData'
                    }
                  },
                  {
                    $addFields: {
                      profilePicture: {
                        $cond: {
                          if: { $gt: [{ $size: '$profilePictureData' }, 0] },
                          then: { $arrayElemAt: ['$profilePictureData.url', 0] },
                          else: null
                        }
                      }
                    }
                  },
                  {
                    $project: {
                      _id: 1,
                      name: 1,
                      email: 1,
                      profilePicture: 1
                    }
                  }
                ],
              },
            },
            {
              $unwind: {
                path: '$sender',
                preserveNullAndEmptyArrays: true,
              },
            },
          ],
          as: 'lastMessage',
        },
      },
      {
        $unwind: {
          path: '$lastMessage',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: 'messages',
          let: { chatId: '$_id', userId: userObjectId },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ['$chatId', '$$chatId'] },
                    { $ne: ['$sender', '$$userId'] },
                    { $not: { $in: ['$$userId', '$readBy'] } }
                  ]
                }
              }
            },
            { $count: 'count' }
          ],
          as: 'unreadCount'
        }
      },
      {
        $project: {
          _id: 1,
          user: {
            $first: {
              $filter: {
                input: '$users',
                as: 'u',
                cond: { $ne: ['$$u._id', userObjectId] }, // Exclude self
              },
            },
          },
          lastMessage: 1,
          unreadCount: {
            $ifNull: [{ $arrayElemAt: ['$unreadCount.count', 0] }, 0]
          },
          updatedAt: 1,
        },
      },
      {
        $sort: {
          'lastMessage.createdAt': -1, // descending order (latest first)
        },
      },
    ];

    if (paginate) {
      const countPipeline = [...pipeline, { $count: 'total' }];
      const [{ total = 0 } = {}] = await this.model.aggregate(countPipeline);
      const { skip, limit } = getPaginationParams({ page, perPage });
      const paginatedPipeline = [...pipeline, { $skip: skip }, { $limit: limit }];

      const chats = await this.model.aggregate(paginatedPipeline);
      return {
        result: chats,
        pagination: buildPaginationMeta(total, page, perPage),
      };
    }

    const chats = await this.model.aggregate(pipeline);
    return chats;
  }

  public getChatById = async (params: { id: string; userId: string }): Promise<Chat> => {
    if (!isValidObjectId(params.id)) throw new Error(`Invalid ObjectId: ${params.id}`);

    // First check if user is participant
    const chat = await this.getById(params.id);
    if (!chat) {
      throw AppError.notFound('Chat not found');
    }

    const isParticipant = chat.participants.some(
      (participantId: any) => participantId.toString() === params.userId
    );

    if (!isParticipant) {
      throw AppError.forbidden('You are not a participant in this chat');
    }

    const pipeline = [
      {
        $match: {
          _id: new mongoose.Types.ObjectId(params.id),
          deletedAt: null
        },
      },
      {
        $lookup: {
          from: 'users',
          let: { participants: '$participants' },
          pipeline: [
            { $match: { $expr: { $in: ['$_id', '$$participants'] } } },
            {
              $lookup: {
                from: 'uploads',
                localField: 'profilePicture',
                foreignField: '_id',
                as: 'profilePictureData'
              }
            },
            {
              $addFields: {
                profilePicture: { $arrayElemAt: ['$profilePictureData.url', 0] }
              }
            },
            {
              $project: {
                _id: 1,
                name: 1,
                email: 1,
                profilePicture: 1
              }
            },
          ],
          as: 'users',
        },
      },
      {
        $lookup: {
          from: 'messages',
          localField: 'lastMessage',
          foreignField: '_id',
          pipeline: [
            { $project: { __v: 0, chatId: 0 } },
            {
              $lookup: {
                from: 'users',
                localField: 'sender',
                foreignField: '_id',
                as: 'sender',
                pipeline: [{ $project: { _id: 1, name: 1, email: 1, profilePicture: 1 } }],
              },
            },
            {
              $unwind: {
                path: '$sender',
                preserveNullAndEmptyArrays: true,
              },
            },
          ],
          as: 'lastMessage',
        },
      },
      {
        $unwind: {
          path: '$lastMessage',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $project: {
          _id: 1,
          user: {
            $first: {
              $filter: {
                input: '$users',
                as: 'u',
                cond: { $ne: ['$$u._id', new mongoose.Types.ObjectId(params.userId)] },
              },
            },
          },
          lastMessage: 1,
          createdAt: 1,
          updatedAt: 1,
        },
      },
    ];

    const [result] = await this.model.aggregate(pipeline);
    return result || null;
  };

}