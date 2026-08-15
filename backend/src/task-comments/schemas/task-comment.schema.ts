import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';

export type TaskCommentDocument = HydratedDocument<TaskComment>;

@Schema({ timestamps: true })
export class TaskComment {
  @Prop({
    required: true,
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Task',
  })
  taskId!: mongoose.Types.ObjectId;

  @Prop({
    required: true,
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  })
  userId!: mongoose.Types.ObjectId;

  @Prop({ required: true })
  comment!: string;

  @Prop({ type: Date, default: null })
  deletedAt?: Date | null;
}

export const TaskCommentSchema = SchemaFactory.createForClass(TaskComment);

TaskCommentSchema.virtual('user', {
  ref: 'User',
  localField: 'createdBy',
  foreignField: '_id',
});

TaskCommentSchema.set('toJSON', {
  virtuals: true,
});

TaskCommentSchema.set('toObject', {
  virtuals: true,
});
