import { Request, Response } from 'express';
import { HTTP_STATUS } from '../app/constants';

const notFound = (req: Request, res: Response) => {
  res.status(HTTP_STATUS.NOT_FOUND).json({
    success: false,
    message: 'API Not Found!',
    error: '',
  });
};

export default notFound; 