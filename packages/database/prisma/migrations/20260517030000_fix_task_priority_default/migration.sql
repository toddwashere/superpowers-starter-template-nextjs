-- AlterTable: change ContactTask.priority default from 'medium' to 'normal'
ALTER TABLE "ContactTask" ALTER COLUMN "priority" SET DEFAULT 'normal';
