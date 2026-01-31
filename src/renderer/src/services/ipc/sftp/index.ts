import { list } from './list'
import { upload, download, cancel } from './transfer'
import { deleteFile, mkdir, rename, chmod } from './operations'
import { readFile, writeFile } from './file'

export const sftpService = {
  list,
  upload,
  download,
  cancel,
  delete: deleteFile,
  mkdir,
  rename,
  chmod,
  readFile,
  writeFile
}
