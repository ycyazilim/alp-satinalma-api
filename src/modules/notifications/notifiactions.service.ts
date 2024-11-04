import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ObjectId } from 'mongoose';
import { User, UserDocument } from '../../schemas/user.schema';

@Injectable()
export class NotifiactionsService {
  constructor(
    @InjectModel(User.name)
    private userModel: Model<UserDocument>,
  ) {}

  async createOneSignalNotificationSpecificUser(
    userId: string,
    message: string,
    title: string,
    type: number,
  ) {
    const user = await this.userModel.findById(userId);
    // Send notification to OneSignal
    if (user?.oneSignalId) {
      const url = 'https://onesignal.com/api/v1/notifications';
      const options = {
        method: 'POST',
        headers: {
          accept: 'application/json',
          Authorization:
            'Basic ZThkODViNjMtMjc0Mi00ODU1LTg4ZDQtOGEwYTY4NzJiNDNk',
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          app_id: '39e98629-5e22-4434-ac78-144ed8ba144d',
          include_subscription_ids: [user.oneSignalId],
          target_channel: 'push',
          data: {
            type: type,
          },
          contents: {
            en: message,
          },
          headings: { en: title },
        }),
      };
      const request = await fetch(url, options);
      const a = await request.json();
      console.log(a);
    }
  }

  chunkArray = (array, size) => {
    const chunkedArr = [];
    let index = 0;
    while (index < array.length) {
      chunkedArr.push(array.slice(index, index + size));
      index += size;
    }
    return chunkedArr;
  };
}
