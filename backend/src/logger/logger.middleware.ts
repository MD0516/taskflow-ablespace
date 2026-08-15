import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response } from 'express';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: () => void) {
    const start = Date.now();

    res.on('finish', () => {
      const diff = Date.now() - start;
      console.log(`[${req.method}] - ${req.originalUrl} --------- ${res.statusCode} | ${diff}ms`);
    });
    next();
  }
}
