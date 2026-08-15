import { forwardRef, Module } from '@nestjs/common';
import { SubTasksService } from './sub-tasks.service';
import { SubTasksController } from './sub-tasks.controller';
import { SubTask, SubTaskSchema } from './schemas/sub-task.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { TasksModule } from 'src/tasks/tasks.module';

@Module({
  imports: [MongooseModule.forFeature([{ name: SubTask.name, schema: SubTaskSchema }]), forwardRef(() => TasksModule)],
  controllers: [SubTasksController],
  providers: [SubTasksService],
  exports: [SubTasksService],
})
export class SubTasksModule {}
