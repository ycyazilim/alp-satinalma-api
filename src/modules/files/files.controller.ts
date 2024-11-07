import { Controller, Get, Param, Res } from '@nestjs/common';
import { Response } from 'express';
import * as path from 'path';
import * as fs from 'fs';
import { Public } from '../../helpers/make-public';
@Controller('file')
export class FilesController {
  @Public()
  @Get(':folder/:imageName')
  getImage(
    @Param('folder') folder: string,
    @Param('imageName') imageName: string,
    @Res() res: Response,
  ) {
    let imageFullPath: string;
    if (folder !== 'gif') {
      imageFullPath = path.join(
        __dirname,
        '../../../uploadedFiles',
        folder,
        imageName,
      );
    } else {
      imageFullPath = path.join(
        __dirname,
        '../../../../gifs',
        imageName.replaceAll('_', ' ') + '.gif',
      );
    }
    console.log(imageFullPath);
    if (fs.existsSync(imageFullPath)) {
      return res.sendFile(imageFullPath);
    } else {
      return res.status(404).send('Resim bulunamadı');
    }
  }
}
