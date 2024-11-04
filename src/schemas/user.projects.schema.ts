import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { UserDocument } from './user.schema';
import { ProjectDocument } from './project.schema';

@Schema({
  timestamps: true,
})
export class UserProject {
  @Prop({
    ref: 'User',
    type: mongoose.Schema.Types.ObjectId,
  })
  user: UserDocument;
  @Prop({
    ref: 'Project',
    type: mongoose.Schema.Types.ObjectId,
  })
  project: ProjectDocument;

  @Prop({
    type: Boolean,
    required: true,
    default: false,
  })
  isDeleted: boolean;

}

export type UserProjectDocument = UserProject & Document;

const UserProjectScheme = SchemaFactory.createForClass(UserProject);

export { UserProjectScheme };
