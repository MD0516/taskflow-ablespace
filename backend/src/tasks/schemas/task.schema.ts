import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Priority, TaskStatus } from 'common/enums';
import mongoose, { HydratedDocument } from 'mongoose';

export type TaskDocument = HydratedDocument<Task>;

@Schema({ timestamps: true })
export class Task {
  @Prop({ required: true })
  title!: string;

  @Prop({ required: true })
  description!: string;

  @Prop()
  labels?: string[];

  @Prop()
  resources?: {
    label: string;
    link: string;
  }[];

  @Prop({ type: String, enum: TaskStatus, default: TaskStatus.Todo })
  status!: TaskStatus;

  @Prop({ type: String, enum: Priority, default: Priority.None })
  priority!: Priority;

  @Prop({ type: Date, default: null })
  dueDate?: Date | null;

  @Prop({
    type: [mongoose.Schema.Types.ObjectId],
    ref: 'User',
  })
  assignees?: mongoose.Types.ObjectId[];

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    default: null,
  })
  projectId?: mongoose.Types.ObjectId | null;

  @Prop({
    required: true,
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  })
  createdBy!: mongoose.Types.ObjectId;

  @Prop({ type: Date, default: null })
  deletedAt?: Date | null;
}

export const TaskSchema = SchemaFactory.createForClass(Task);

TaskSchema.virtual('subTasks', {
  ref: 'SubTask',
  localField: '_id',
  foreignField: 'taskId',
  match: { deletedAt: null },
});

TaskSchema.virtual('project', {
  ref: 'Project',
  localField: 'projectId',
  foreignField: '_id',
  match: { deletedAt: null },
});

TaskSchema.virtual('user', {
  ref: 'User',
  localField: 'createdBy',
  foreignField: '_id',
});

TaskSchema.virtual('members', {
  ref: 'User',
  localField: 'assignees',
  foreignField: '_id',
});

TaskSchema.virtual('comments', {
  ref: 'TaskComment',
  localField: '_id',
  foreignField: 'taskId',
  match: { deletedAt: null },
});

TaskSchema.set('toJSON', {
  virtuals: true,
});

TaskSchema.set('toObject', {
  virtuals: true,
});
