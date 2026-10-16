import { applyDecorators, HttpStatus } from '@nestjs/common'
import { ApiBody, ApiOperation, ApiParam, ApiQuery, ApiResponse } from '@nestjs/swagger'
import {
  CreateReleaseTaskDto,
  DeleteReleaseTaskDto,
  UpdateReleaseTaskDto,
} from '../dtos/release-task.dto'
import {
  ArtistTaskPageEntity,
  ReleaseTaskDeletedEntity,
  ReleaseTaskEntity,
  ReleaseTaskListEntity,
} from '../entities/release-task.entity'

const releaseParam = ApiParam({ name: 'id', format: 'uuid' })
const taskParam = ApiParam({ name: 'taskId', format: 'uuid' })
const releaseMissing = ApiResponse({
  status: HttpStatus.NOT_FOUND,
  description: 'Release or task unavailable to this artist',
})
const taskConflict = ApiResponse({
  status: HttpStatus.CONFLICT,
  description: 'Task changed since it was read',
})

export function ListReleaseTasksSwagger() {
  return applyDecorators(
    ApiOperation({
      summary: 'List the tasks of an owned release',
      description: 'Open work first, then the nearest deadline; at most 200 tasks.',
    }),
    releaseParam,
    ApiResponse({ status: HttpStatus.OK, type: ReleaseTaskListEntity }),
    releaseMissing,
  )
}

export function CreateReleaseTaskSwagger() {
  return applyDecorators(
    ApiOperation({
      summary: 'Add a task to an owned release',
      description:
        'Tasks are planning notes: they stay editable after submission and never change the release version.',
    }),
    releaseParam,
    ApiBody({ type: CreateReleaseTaskDto }),
    ApiResponse({ status: HttpStatus.CREATED, type: ReleaseTaskEntity }),
    ApiResponse({
      status: HttpStatus.BAD_REQUEST,
      description: 'Invalid fields, or an assignee not credited on this release',
    }),
    releaseMissing,
  )
}

export function UpdateReleaseTaskSwagger() {
  return applyDecorators(
    ApiOperation({
      summary: 'Edit, assign or complete a task',
      description: 'Setting DONE records the completion time; moving back clears it.',
    }),
    releaseParam,
    taskParam,
    ApiBody({ type: UpdateReleaseTaskDto }),
    ApiResponse({ status: HttpStatus.OK, type: ReleaseTaskEntity }),
    ApiResponse({
      status: HttpStatus.BAD_REQUEST,
      description: 'Invalid fields, or an assignee not credited on this release',
    }),
    releaseMissing,
    taskConflict,
  )
}

export function DeleteReleaseTaskSwagger() {
  return applyDecorators(
    ApiOperation({ summary: 'Delete a task' }),
    releaseParam,
    taskParam,
    ApiBody({ type: DeleteReleaseTaskDto }),
    ApiResponse({ status: HttpStatus.OK, type: ReleaseTaskDeletedEntity }),
    releaseMissing,
    taskConflict,
  )
}

export function ListArtistTasksSwagger() {
  return applyDecorators(
    ApiOperation({
      summary: "List tasks across the artist's releases",
      description:
        'Paginated; OPEN lists everything not done. Counts per status and overdue cover every task.',
    }),
    ApiQuery({ name: 'status', required: false, enum: ['TODO', 'IN_PROGRESS', 'DONE', 'OPEN'] }),
    ApiQuery({ name: 'page', required: false, type: Number }),
    ApiQuery({ name: 'limit', required: false, type: Number }),
    ApiResponse({ status: HttpStatus.OK, type: ArtistTaskPageEntity }),
  )
}
