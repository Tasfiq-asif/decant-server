import { TUser } from "./user.interface";
import { User } from "./user.model";
import AppError from "../../errors/AppError";

const createUserIntoDB = async (userData: TUser) => {
  const result = await User.create(userData);
  return result;
};

const getAllUsersFromDB = async (query?: {
  page?: number;
  limit?: number;
  search?: string;
  role?: string;
  isActive?: boolean;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}) => {
  const {
    page = 1,
    limit = 10,
    search,
    role,
    isActive,
    sortBy = "createdAt",
    sortOrder = "desc",
  } = query || {};

  const filter: any = { isDeleted: false };

  // Search functionality
  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
    ];
  }

  // Role filter
  if (role) {
    filter.role = role;
  }

  // Active status filter
  if (typeof isActive === "boolean") {
    filter.isActive = isActive;
  }

  const skip = (Number(page) - 1) * Number(limit);
  const sortOptions: any = { [sortBy]: sortOrder === "desc" ? -1 : 1 };

  const [users, total] = await Promise.all([
    User.find(filter)
      .select("-password")
      .sort(sortOptions)
      .skip(skip)
      .limit(Number(limit)),
    User.countDocuments(filter),
  ]);

  return {
    users,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total,
      totalPages: Math.ceil(total / Number(limit)),
    },
  };
};

const getSingleUserFromDB = async (id: string) => {
  const result = await User.findById(id);
  return result;
};

const updateUserInDB = async (id: string, payload: Partial<TUser>) => {
  const result = await User.findByIdAndUpdate(id, payload, {
    new: true,
    runValidators: true,
  });
  return result;
};

const deleteUserFromDB = async (id: string) => {
  const result = await User.findByIdAndUpdate(
    id,
    { isDeleted: true },
    { new: true }
  );
  return result;
};

const getUserByEmail = async (email: string) => {
  const result = await User.findOne({ email, isDeleted: false }).select(
    "+password"
  );
  return result;
};

const updateUserRole = async (id: string, role: "user" | "admin") => {
  const result = await User.findByIdAndUpdate(
    id,
    { role },
    { new: true, runValidators: true }
  ).select("-password");
  return result;
};

const getUserStats = async () => {
  const stats = await User.aggregate([
    { $match: { isDeleted: false } },
    {
      $group: {
        _id: null,
        totalUsers: { $sum: 1 },
        activeUsers: {
          $sum: { $cond: [{ $eq: ["$isActive", true] }, 1, 0] },
        },
        inactiveUsers: {
          $sum: { $cond: [{ $eq: ["$isActive", false] }, 1, 0] },
        },
        adminUsers: {
          $sum: { $cond: [{ $eq: ["$role", "admin"] }, 1, 0] },
        },
        regularUsers: {
          $sum: { $cond: [{ $eq: ["$role", "user"] }, 1, 0] },
        },
      },
    },
  ]);

  return (
    stats[0] || {
      totalUsers: 0,
      activeUsers: 0,
      inactiveUsers: 0,
      adminUsers: 0,
      regularUsers: 0,
    }
  );
};

// User Dashboard Service
const getUserDashboardData = async (userId: string) => {
  try {
    // Import Order model dynamically to avoid circular dependency
    const OrderModel = await import("../order/order.model");
    const Order = OrderModel.Order;

    // Get order stats
    const totalOrders = await Order.countDocuments({ user: userId });
    const pendingOrders = await Order.countDocuments({
      user: userId,
      orderStatus: { $in: ["pending", "confirmed", "processing"] },
    });

    // Get recent orders (last 5)
    const recentOrders = await Order.find({ user: userId })
      .populate("items.product", "name image")
      .sort({ createdAt: -1 })
      .limit(5)
      .select("orderNumber items totalAmount orderStatus createdAt");

    return {
      totalOrders,
      pendingOrders,
      recentOrders: recentOrders.map((order) => ({
        id: order.orderNumber,
        productName: order.items[0]?.productName || "Multiple Items",
        amount: order.totalAmount,
        status: order.orderStatus,
        date: order.createdAt?.toISOString().split("T")[0] || "",
      })),
    };
  } catch (error) {
    console.error("Error in getUserDashboardData:", error);
    // Return default data if there's an error
    return {
      totalOrders: 0,
      pendingOrders: 0,
      recentOrders: [],
    };
  }
};

// Profile Services
const getUserProfile = async (userId: string) => {
  const user = await User.findById(userId).select("-password");
  if (!user) {
    throw new AppError(404, "User not found");
  }
  return user;
};

const updateUserProfile = async (userId: string, payload: Partial<TUser>) => {
  const user = await User.findByIdAndUpdate(userId, payload, {
    new: true,
    runValidators: true,
  }).select("-password");

  if (!user) {
    throw new AppError(404, "User not found");
  }

  return user;
};

export const UserServices = {
  createUserIntoDB,
  getAllUsersFromDB,
  getSingleUserFromDB,
  updateUserInDB,
  updateUserRole,
  deleteUserFromDB,
  getUserByEmail,
  getUserStats,
  getUserDashboardData,
  getUserProfile,
  updateUserProfile,
};
