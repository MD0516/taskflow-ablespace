import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Priority } from 'common/enums';
import mongoose, { HydratedDocument } from 'mongoose';

export type ProjectDocument = HydratedDocument<Project>;

@Schema({ timestamps: true })
export class Project {
  @Prop({ required: true })
  title!: string;

  @Prop({ required: true })
  description!: string;

  @Prop({ type: String, enum: Priority, default: Priority.None })
  priority!: Priority;

  @Prop({ type: Date, default: null })
  dueDate?: Date | null;

  @Prop({ default: false })
  isPrivate!: boolean;

  @Prop({
    required: true,
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  })
  createdBy!: mongoose.Types.ObjectId;

  @Prop({ type: Date, default: null })
  deletedAt?: Date | null;
}

export const ProjectSchema = SchemaFactory.createForClass(Project);

ProjectSchema.virtual('tasks', {
  ref: 'Task',
  localField: '_id',
  foreignField: 'projectId',
  match: { deletedAt: null },
});

ProjectSchema.virtual('user', {
  ref: 'User',
  localField: 'createdBy',
  foreignField: '_id',
});

ProjectSchema.set('toJSON', {
  virtuals: true,
});

ProjectSchema.set('toObject', {
  virtuals: true,
});
