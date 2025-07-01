import { Request, Response } from "express";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { UserServices } from "./user.service";
import { HTTP_STATUS } from "../../constants";

const createUser = catchAsync(async (req: Request, res: Response) => {
  const result = await UserServices.createUserIntoDB(req.body);

  sendResponse(res, {
    statusCode: HTTP_STATUS.CREATED,
    success: true,
    message: "User created successfully",
    data: result,
  });
});

const getAllUsers = catchAsync(async (req: Request, res: Response) => {
  const result = await UserServices.getAllUsersFromDB(req.query);

  sendResponse(res, {
    statusCode: HTTP_STATUS.OK,
    success: true,
    message: "Users retrieved successfully",
    data: result.users,
    meta: result.pagination,
  });
});

const getSingleUser = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await UserServices.getSingleUserFromDB(id);

  sendResponse(res, {
    statusCode: HTTP_STATUS.OK,
    success: true,
    message: "User retrieved successfully",
    data: result,
  });
});

const updateUser = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await UserServices.updateUserInDB(id, req.body);

  sendResponse(res, {
    statusCode: HTTP_STATUS.OK,
    success: true,
    message: "User updated successfully",
    data: result,
  });
});

const deleteUser = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await UserServices.deleteUserFromDB(id);

  sendResponse(res, {
    statusCode: HTTP_STATUS.OK,
    success: true,
    message: "User deleted successfully",
    data: result,
  });
});

const updateUserRole = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { role } = req.body;
  const result = await UserServices.updateUserRole(id, role);

  sendResponse(res, {
    statusCode: HTTP_STATUS.OK,
    success: true,
    message: "User role updated successfully",
    data: result,
  });
});

const getUserStats = catchAsync(async (req: Request, res: Response) => {
  const result = await UserServices.getUserStats();

  sendResponse(res, {
    statusCode: HTTP_STATUS.OK,
    success: true,
    message: "User statistics retrieved successfully",
    data: result,
  });
});

export const UserControllers = {
  createUser,
  getAllUsers,
  getSingleUser,
  updateUser,
  updateUserRole,
  deleteUser,
  getUserStats,
};
