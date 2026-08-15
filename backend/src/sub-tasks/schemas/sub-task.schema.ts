import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Priority } from 'common/enums';
import mongoose, { HydratedDocument } from 'mongoose';

export type SubTaskDocument = HydratedDocument<SubTask>;

@Schema({ timestamps: true })
export class SubTask {
  @Prop({
    required: true,
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Task',
  })
  taskId!: mongoose.Types.ObjectId;

  @Prop({ required: true })
  title!: string;

  @Prop({ type: String, enum: Priority, default: Priority.None })
  priority!: Priority;

  @Prop({
    type: [mongoose.Schema.Types.ObjectId],
    ref: 'User',
  })
  assignees?: mongoose.Types.ObjectId[];

  @Prop({
    required: true,
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  })
  createdBy!: mongoose.Types.ObjectId;

  @Prop({ type: Date, default: null })
  deletedAt?: Date | null;
}

export const SubTaskSchema = SchemaFactory.createForClass(SubTask);

SubTaskSchema.virtual('user', {
  ref: 'User',
  localField: 'createdBy',
  foreignField: '_id',
});

SubTaskSchema.virtual('members', {
  ref: 'User',
  localField: 'assignees',
  foreignField: '_id',
});

SubTaskSchema.set('toJSON', {
  virtuals: true,
});

SubTaskSchema.set('toObject', {
  virtuals: true,
});
