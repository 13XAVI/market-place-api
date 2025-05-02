import { Test, TestingModule } from '@nestjs/testing';
import { OrderService } from './order.service';
import { PrismaService } from '../prisma/prisma.service';
import { CustomError } from '../utils/customClass';
import { CreateOrderDto, UpdateOrderStatusDto } from '../dtos';
import { ORDER_STATUS, ROLES } from '../utils/enum';
import * as priceUtils from '../utils/functions/price';

describe('OrderService', () => {
  let orderService: OrderService;
  let prismaService: PrismaService;

  const mockPrismaService = {
    product: {
      findMany: jest.fn(),
    },
    order: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    store: {
      findMany: jest.fn(),
    },
    user: {
      select: jest.fn(),
    },
  };

  jest.mock('../utils/functions/price', () => ({
    totalPriceofOrder: jest.fn(),
  }));

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrderService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    orderService = module.get<OrderService>(OrderService);
    prismaService = module.get<PrismaService>(PrismaService);

    jest.clearAllMocks();
  });

  describe('createOrder', () => {
    const userId = 'user-id-1';
    const createOrderDto: CreateOrderDto = {
      items: [
        { productId: 'product-id-1', quantity: 2 },
        { productId: 'product-id-2', quantity: 1 },
      ],
    };
    const mockProducts = [
      { id: 'product-id-1', price: 100, storeId: 'store-id-1' },
      { id: 'product-id-2', price: 50, storeId: 'store-id-1' },
    ];
    const mockOrder = {
      id: 'order-id-1',
      userId,
      total: 250,
      status: ORDER_STATUS.PENDING,
      items: [
        { productId: 'product-id-1', quantity: 2, product: mockProducts[0] },
        { productId: 'product-id-2', quantity: 1, product: mockProducts[1] },
      ],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    it('should create an order successfully', async () => {
      mockPrismaService.product.findMany.mockResolvedValue(mockProducts);
      (priceUtils.totalPriceofOrder as jest.Mock).mockReturnValue(250);
      mockPrismaService.order.create.mockResolvedValue(mockOrder);

      const result = await orderService.createOrder(userId, createOrderDto);

      expect(prismaService.product.findMany).toHaveBeenCalledWith({
        where: { id: { in: ['product-id-1', 'product-id-2'] } },
        select: { id: true, price: true, storeId: true },
      });
      expect(priceUtils.totalPriceofOrder).toHaveBeenCalledWith(
        mockProducts,
        createOrderDto.items,
      );
      expect(prismaService.order.create).toHaveBeenCalledWith({
        data: {
          userId,
          total: 250,
          status: ORDER_STATUS.PENDING,
          items: {
            create: [
              { productId: 'product-id-1', quantity: 2 },
              { productId: 'product-id-2', quantity: 1 },
            ],
          },
        },
        include: { items: { include: { product: true } } },
      });
      expect(result).toEqual({
        message: 'Successfully created order',
        data: mockOrder,
      });
    });

    it('should throw 400 if items are missing or empty', async () => {
      const invalidDto = { items: [] };

      await expect(
        orderService.createOrder(userId, invalidDto),
      ).rejects.toEqual(new CustomError(400, 'At least one item is required'));
      expect(prismaService.product.findMany).not.toHaveBeenCalled();
    });

    it('should throw 404 if some products are not found', async () => {
      mockPrismaService.product.findMany.mockResolvedValue([mockProducts[0]]);

      await expect(
        orderService.createOrder(userId, createOrderDto),
      ).rejects.toEqual(new CustomError(404, 'Products not found'));
      expect(prismaService.product.findMany).toHaveBeenCalledWith({
        where: { id: { in: ['product-id-1', 'product-id-2'] } },
        select: { id: true, price: true, storeId: true },
      });
    });

    it('should throw 500 for unexpected errors', async () => {
      mockPrismaService.product.findMany.mockRejectedValue(
        new Error('Database error'),
      );

      await expect(
        orderService.createOrder(userId, createOrderDto),
      ).rejects.toEqual(new CustomError(500, 'Unexpected error occurred'));
      expect(prismaService.product.findMany).toHaveBeenCalledWith({
        where: { id: { in: ['product-id-1', 'product-id-2'] } },
        select: { id: true, price: true, storeId: true },
      });
    });
  });

  describe('getOrdersForShopper', () => {
    const userId = 'user-id-1';
    const mockOrders = [
      {
        id: 'order-id-1',
        userId,
        total: 250,
        status: ORDER_STATUS.PENDING,
        items: [
          {
            productId: 'product-id-1',
            quantity: 2,
            product: {
              name: 'Laptop',
              image: 'laptop.jpg',
              price: 100,
              store: { name: 'Tech Store' },
            },
          },
        ],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    it('should retrieve all orders for a shopper successfully', async () => {
      mockPrismaService.order.findMany.mockResolvedValue(mockOrders);

      const result = await orderService.getOrdersForShopper(userId);

      expect(prismaService.order.findMany).toHaveBeenCalledWith({
        where: { userId },
        include: {
          items: {
            include: {
              product: {
                select: {
                  name: true,
                  image: true,
                  price: true,
                  store: {
                    select: {
                      name: true,
                      owner: true,
                      products: true,
                      _count: true,
                      createdAt: true,
                      updatedAt: true,
                    },
                  },
                },
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      });
      expect(result).toEqual({
        message: 'Successfully retrieved orders',
        data: mockOrders,
      });
    });

    it('should return empty array if no orders exist', async () => {
      mockPrismaService.order.findMany.mockResolvedValue([]);

      const result = await orderService.getOrdersForShopper(userId);

      expect(prismaService.order.findMany).toHaveBeenCalledWith({
        where: { userId },
        include: expect.any(Object),
        orderBy: { createdAt: 'desc' },
      });
      expect(result).toEqual({
        message: 'Successfully retrieved orders',
        data: [],
      });
    });

    it('should throw 500 for unexpected errors', async () => {
      mockPrismaService.order.findMany.mockRejectedValue(
        new Error('Database error'),
      );

      await expect(orderService.getOrdersForShopper(userId)).rejects.toEqual(
        new CustomError(500, 'Unexpected error occurred'),
      );
      expect(prismaService.order.findMany).toHaveBeenCalledWith({
        where: { userId },
        include: expect.any(Object),
        orderBy: { createdAt: 'desc' },
      });
    });
  });

  describe('getOrderByIdForShopper', () => {
    const userId = 'user-id-1';
    const orderId = 'order-id-1';
    const mockOrder = {
      id: orderId,
      userId,
      total: 250,
      status: ORDER_STATUS.PENDING,
      items: [
        {
          productId: 'product-id-1',
          quantity: 2,
          product: {
            name: 'Laptop',
            image: 'laptop.jpg',
            price: 100,
            store: { name: 'Tech Store' },
          },
        },
      ],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    it('should retrieve an order by ID for a shopper successfully', async () => {
      mockPrismaService.order.findUnique.mockResolvedValue(mockOrder);

      const result = await orderService.getOrderByIdForShopper(userId, orderId);

      expect(prismaService.order.findUnique).toHaveBeenCalledWith({
        where: { id: orderId },
        include: {
          items: {
            include: {
              product: {
                select: {
                  name: true,
                  image: true,
                  price: true,
                  store: { select: { name: true } },
                },
              },
            },
          },
        },
      });
      expect(result).toEqual({
        message: 'successfully retrived order',
        data: mockOrder,
      });
    });

    it('should throw 404 if order is not found', async () => {
      mockPrismaService.order.findUnique.mockResolvedValue(null);

      await expect(
        orderService.getOrderByIdForShopper(userId, orderId),
      ).rejects.toEqual(new CustomError(404, 'Order not found'));
      expect(prismaService.order.findUnique).toHaveBeenCalledWith({
        where: { id: orderId },
        include: expect.any(Object),
      });
    });

    it('should throw 400 if user lacks permission', async () => {
      mockPrismaService.order.findUnique.mockResolvedValue({
        ...mockOrder,
        userId: 'other-user-id',
      });
      await expect(
        orderService.getOrderByIdForShopper(userId, orderId),
      ).rejects.toEqual(
        new CustomError(400, 'You do not have permission to view this order'),
      );
      expect(prismaService.order.findUnique).toHaveBeenCalledWith({
        where: { id: orderId },
        include: expect.any(Object),
      });
    });

    it('should throw 500 for unexpected errors', async () => {
      mockPrismaService.order.findUnique.mockRejectedValue(
        new Error('Database error'),
      );
      await expect(
        orderService.getOrderByIdForShopper(userId, orderId),
      ).rejects.toEqual(new CustomError(500, 'Unexpected error occurred'));
      expect(prismaService.order.findUnique).toHaveBeenCalledWith({
        where: { id: orderId },
        include: expect.any(Object),
      });
    });
  });

  describe('getOrdersForSeller', () => {
    const sellerId = 'seller-id-1';
    const mockStores = [{ id: 'store-id-1' }, { id: 'store-id-2' }];
    const mockOrders = [
      {
        id: 'order-id-1',
        userId: 'user-id-1',
        total: 250,
        status: ORDER_STATUS.PENDING,
        items: [
          {
            productId: 'product-id-1',
            quantity: 2,
            product: {
              id: 'product-id-1',
              name: 'Laptop',
              price: 100,
              storeId: 'store-id-1',
              store: { name: 'Tech Store' },
            },
          },
        ],
        user: { name: 'John Doe', email: 'john@example.com' },
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    it('should retrieve orders for a seller successfully', async () => {
      mockPrismaService.store.findMany.mockResolvedValue(mockStores);
      mockPrismaService.order.findMany.mockResolvedValue(mockOrders);

      const result = await orderService.getOrdersForSeller(sellerId);

      expect(prismaService.store.findMany).toHaveBeenCalledWith({
        where: { ownerId: sellerId },
        select: { id: true },
      });
      expect(prismaService.order.findMany).toHaveBeenCalledWith({
        where: {
          items: {
            some: {
              product: {
                storeId: { in: ['store-id-1', 'store-id-2'] },
              },
            },
          },
        },
        include: {
          items: {
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
                  price: true,
                  storeId: true,
                  store: { select: { name: true } },
                },
              },
            },
          },
          user: { select: { name: true, email: true } },
        },
        orderBy: { createdAt: 'desc' },
      });
      expect(result).toEqual({
        message: 'Orders retrived Successfull',
        data: mockOrders,
      });
    });

    it('should return empty array if no orders exist', async () => {
      mockPrismaService.store.findMany.mockResolvedValue(mockStores);
      mockPrismaService.order.findMany.mockResolvedValue([]);

      const result = await orderService.getOrdersForSeller(sellerId);

      expect(prismaService.store.findMany).toHaveBeenCalledWith({
        where: { ownerId: sellerId },
        select: { id: true },
      });
      expect(prismaService.order.findMany).toHaveBeenCalledWith({
        where: expect.any(Object),
        include: expect.any(Object),
        orderBy: { createdAt: 'desc' },
      });
      expect(result).toEqual({
        message: 'Orders retrived Successfull',
        data: [],
      });
    });

    it('should throw 500 for unexpected errors', async () => {
      mockPrismaService.store.findMany.mockRejectedValue(
        new Error('Database error'),
      );

      await expect(orderService.getOrdersForSeller(sellerId)).rejects.toEqual(
        new CustomError(500, 'Unexpected error occurred'),
      );
      expect(prismaService.store.findMany).toHaveBeenCalledWith({
        where: { ownerId: sellerId },
        select: { id: true },
      });
    });
  });

  describe('updateOrderStatus', () => {
    const userId = 'user-id-1';
    const orderId = 'order-id-1';
    const updateOrderStatusDto: UpdateOrderStatusDto = {
      status: ORDER_STATUS.SHIPPED,
    };
    const mockOrder = {
      id: orderId,
      userId: 'shopper-id-1',
      total: 250,
      status: ORDER_STATUS.PENDING,
      items: [
        {
          productId: 'product-id-1',
          quantity: 2,
          product: { storeId: 'store-id-1' },
        },
      ],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const mockUpdatedOrder = {
      ...mockOrder,
      status: ORDER_STATUS.SHIPPED,
    };
    const mockStores = [{ id: 'store-id-1' }];

    it('should update order status successfully as admin', async () => {
      mockPrismaService.order.findUnique.mockResolvedValue(mockOrder);
      mockPrismaService.order.update.mockResolvedValue(mockUpdatedOrder);

      const result = await orderService.updateOrderStatus(
        userId,
        ROLES.ADMIN,
        orderId,
        updateOrderStatusDto,
      );

      expect(prismaService.order.findUnique).toHaveBeenCalledWith({
        where: { id: orderId },
        include: {
          items: { include: { product: { select: { storeId: true } } } },
        },
      });
      expect(prismaService.order.update).toHaveBeenCalledWith({
        where: { id: orderId },
        data: { status: ORDER_STATUS.SHIPPED },
        include: { items: { include: { product: true } } },
      });
      expect(result).toEqual({
        message: 'Successfully updated order',
        data: mockUpdatedOrder,
      });
    });

    it('should update order status successfully as seller with permission', async () => {
      mockPrismaService.order.findUnique.mockResolvedValue(mockOrder);
      mockPrismaService.store.findMany.mockResolvedValue(mockStores);
      mockPrismaService.order.update.mockResolvedValue(mockUpdatedOrder);

      const result = await orderService.updateOrderStatus(
        userId,
        ROLES.SELLER,
        orderId,
        updateOrderStatusDto,
      );

      expect(prismaService.order.findUnique).toHaveBeenCalledWith({
        where: { id: orderId },
        include: {
          items: { include: { product: { select: { storeId: true } } } },
        },
      });
      expect(prismaService.store.findMany).toHaveBeenCalledWith({
        where: { ownerId: userId },
        select: { id: true },
      });
      expect(prismaService.order.update).toHaveBeenCalledWith({
        where: { id: orderId },
        data: { status: ORDER_STATUS.SHIPPED },
        include: { items: { include: { product: true } } },
      });
      expect(result).toEqual({
        message: 'Successfully update Order Status',
        data: mockUpdatedOrder,
      });
    });

    it('should throw 404 if order is not found', async () => {
      mockPrismaService.order.findUnique.mockResolvedValue(null);

      await expect(
        orderService.updateOrderStatus(
          userId,
          ROLES.ADMIN,
          orderId,
          updateOrderStatusDto,
        ),
      ).rejects.toEqual(new CustomError(404, 'Order not found'));
      expect(prismaService.order.findUnique).toHaveBeenCalledWith({
        where: { id: orderId },
        include: expect.any(Object),
      });
      expect(prismaService.order.update).not.toHaveBeenCalled();
    });

    it('should throw 403 if seller lacks permission', async () => {
      mockPrismaService.order.findUnique.mockResolvedValue(mockOrder);
      mockPrismaService.store.findMany.mockResolvedValue([
        { id: 'other-store-id' },
      ]);

      await expect(
        orderService.updateOrderStatus(
          userId,
          ROLES.SELLER,
          orderId,
          updateOrderStatusDto,
        ),
      ).rejects.toEqual(
        new CustomError(403, 'You do not have permission to update this order'),
      );
      expect(prismaService.order.findUnique).toHaveBeenCalledWith({
        where: { id: orderId },
        include: expect.any(Object),
      });
      expect(prismaService.store.findMany).toHaveBeenCalledWith({
        where: { ownerId: userId },
        select: { id: true },
      });
      expect(prismaService.order.update).not.toHaveBeenCalled();
    });

    it('should throw 403 if user is a shopper', async () => {
      mockPrismaService.order.findUnique.mockResolvedValue(mockOrder);

      await expect(
        orderService.updateOrderStatus(
          userId,
          ROLES.SHOPPER,
          orderId,
          updateOrderStatusDto,
        ),
      ).rejects.toEqual(
        new CustomError(403, 'You do not have permission to update this order'),
      );
      expect(prismaService.order.findUnique).toHaveBeenCalledWith({
        where: { id: orderId },
        include: expect.any(Object),
      });
      expect(prismaService.order.update).not.toHaveBeenCalled();
    });

    it('should throw 500 for unexpected errors', async () => {
      mockPrismaService.order.findUnique.mockRejectedValue(
        new Error('Database error'),
      );

      await expect(
        orderService.updateOrderStatus(
          userId,
          ROLES.ADMIN,
          orderId,
          updateOrderStatusDto,
        ),
      ).rejects.toEqual(new CustomError(500, 'Unexpected error occurred'));
      expect(prismaService.order.findUnique).toHaveBeenCalledWith({
        where: { id: orderId },
        include: expect.any(Object),
      });
    });
  });
});
