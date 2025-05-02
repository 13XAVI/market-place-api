import { Test, TestingModule } from '@nestjs/testing';
import { ProductService } from './product.service';
import { PrismaService } from '../prisma/prisma.service';
import { CustomError } from '../utils/customClass';
import { ProductDto } from '../dtos';

describe('ProductService', () => {
  let productService: ProductService;
  let prismaService: PrismaService;

  const mockPrismaService = {
    store: {
      findUnique: jest.fn(),
    },
    product: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    category: {
      findUnique: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    productService = module.get<ProductService>(ProductService);
    prismaService = module.get<PrismaService>(PrismaService);

    jest.clearAllMocks();
  });

  describe('createProduct', () => {
    const userId = 'user-id-1';
    const productDto: ProductDto = {
      name: 'Laptop',
      image: ['laptop.jpg'],
      price: 999.99,
      categoryId: 'category-id-1',
      storeId: 'store-id-1',
      isFeatured: true,
    };
    const mockStore = { id: 'store-id-1', ownerId: userId };
    const mockProduct = {
      id: 'product-id-1',
      name: 'Laptop',
      image: 'laptop.jpg',
      price: 999.99,
      categoryId: 'category-id-1',
      storeId: 'store-id-1',
      isFeatured: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    it('should create a product successfully', async () => {
      mockPrismaService.store.findUnique.mockResolvedValue(mockStore);
      mockPrismaService.product.create.mockResolvedValue(mockProduct);

      const result = await productService.createProduct(productDto, userId);

      expect(prismaService.store.findUnique).toHaveBeenCalledWith({
        where: { id: productDto.storeId },
      });
      expect(prismaService.product.create).toHaveBeenCalledWith({
        data: {
          name: productDto.name,
          image: productDto.image,
          price: productDto.price,
          categoryId: productDto.categoryId,
          storeId: productDto.storeId,
          isFeatured: productDto.isFeatured,
        },
      });
      expect(result).toEqual({
        message: 'Product created successfully',
        data: mockProduct,
      });
    });

    it('should throw 404 if store is not found', async () => {
      mockPrismaService.store.findUnique.mockResolvedValue(null);

      await expect(
        productService.createProduct(productDto, userId),
      ).rejects.toEqual(new CustomError(404, 'Store not found'));
      expect(prismaService.store.findUnique).toHaveBeenCalledWith({
        where: { id: productDto.storeId },
      });
      expect(prismaService.product.create).not.toHaveBeenCalled();
    });

    it('should throw 403 if user does not own the store', async () => {
      mockPrismaService.store.findUnique.mockResolvedValue({
        ...mockStore,
        ownerId: 'other-user-id',
      });

      await expect(
        productService.createProduct(productDto, userId),
      ).rejects.toEqual(new CustomError(403, 'You do not own this store'));
      expect(prismaService.store.findUnique).toHaveBeenCalledWith({
        where: { id: productDto.storeId },
      });
      expect(prismaService.product.create).not.toHaveBeenCalled();
    });

    it('should throw 500 for unexpected errors', async () => {
      mockPrismaService.store.findUnique.mockRejectedValue(
        new Error('Database error'),
      );

      await expect(
        productService.createProduct(productDto, userId),
      ).rejects.toEqual(new CustomError(500, 'Unexpected error occurred'));
      expect(prismaService.store.findUnique).toHaveBeenCalledWith({
        where: { id: productDto.storeId },
      });
    });
  });

  describe('findOneProduct', () => {
    const productId = 'product-id-1';
    const mockProduct = {
      id: productId,
      name: 'Laptop',
      image: 'laptop.jpg',
      price: 999.99,
      categoryId: 'category-id-1',
      storeId: 'store-id-1',
      isFeatured: true,
      category: { id: 'category-id-1', name: 'Electronics' },
      store: { id: 'store-id-1', name: 'Tech Store' },
      reviews: [
        {
          id: 'review-id-1',
          rating: 5,
          comment: 'Great product',
          createdAt: new Date(),
        },
      ],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    it('should retrieve a product by ID successfully', async () => {
      mockPrismaService.product.findUnique.mockResolvedValue(mockProduct);

      const result = await productService.findOneProduct(productId);

      expect(prismaService.product.findUnique).toHaveBeenCalledWith({
        where: { id: productId },
        include: {
          category: { select: { id: true, name: true } },
          store: { select: { id: true, name: true } },
          reviews: {
            select: { id: true, rating: true, comment: true, createdAt: true },
          },
        },
      });
      expect(result).toEqual({
        message: 'Product retrieved successfully',
        data: mockProduct,
      });
    });

    it('should throw 400 if ID is missing', async () => {
      await expect(productService.findOneProduct('')).rejects.toEqual(
        new CustomError(400, 'Product ID is required'),
      );
      expect(prismaService.product.findUnique).not.toHaveBeenCalled();
    });

    it('should throw 404 if product is not found', async () => {
      mockPrismaService.product.findUnique.mockResolvedValue(null);

      await expect(productService.findOneProduct(productId)).rejects.toEqual(
        new CustomError(404, 'Product not found'),
      );
      expect(prismaService.product.findUnique).toHaveBeenCalledWith({
        where: { id: productId },
        include: expect.any(Object),
      });
    });

    it('should throw 500 for unexpected errors', async () => {
      mockPrismaService.product.findUnique.mockRejectedValue(
        new Error('Database error'),
      );

      await expect(productService.findOneProduct(productId)).rejects.toEqual(
        new CustomError(500, 'Unexpected error occurred'),
      );
      expect(prismaService.product.findUnique).toHaveBeenCalledWith({
        where: { id: productId },
        include: expect.any(Object),
      });
    });
  });

  describe('findAllProducts', () => {
    const mockProducts = [
      {
        id: 'product-id-1',
        name: 'Laptop',
        image: 'laptop.jpg',
        price: 999.99,
        categoryId: 'category-id-1',
        storeId: 'store-id-1',
        isFeatured: true,
        category: { id: 'category-id-1', name: 'Electronics' },
        store: { id: 'store-id-1', name: 'Tech Store' },
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    it('should retrieve all products successfully', async () => {
      mockPrismaService.product.findMany.mockResolvedValue(mockProducts);

      const result = await productService.findAllProducts();

      expect(prismaService.product.findMany).toHaveBeenCalledWith({
        include: {
          category: { select: { id: true, name: true } },
          store: { select: { id: true, name: true } },
        },
      });
      expect(result).toEqual({
        message: 'Products retrieved successfully',
        data: mockProducts,
      });
    });

    it('should return empty array if no products exist', async () => {
      mockPrismaService.product.findMany.mockResolvedValue([]);

      const result = await productService.findAllProducts();

      expect(prismaService.product.findMany).toHaveBeenCalledWith({
        include: expect.any(Object),
      });
      expect(result).toEqual({
        message: 'Products retrieved successfully',
        data: [],
      });
    });

    it('should throw 500 for unexpected errors', async () => {
      mockPrismaService.product.findMany.mockRejectedValue(
        new Error('Database error'),
      );

      await expect(productService.findAllProducts()).rejects.toEqual(
        new CustomError(500, 'Unexpected error occurred'),
      );
      expect(prismaService.product.findMany).toHaveBeenCalledWith({
        include: expect.any(Object),
      });
    });
  });

  describe('updateProduct', () => {
    const userId = 'user-id-1';
    const productId = 'product-id-1';
    const productDto: ProductDto = {
      name: 'Updated Laptop',
      image: ['updated-laptop.jpg'],
      price: 1099.99,
      categoryId: 'category-id-2',
      storeId: 'store-id-1',
      isFeatured: false,
    };
    const mockProduct = {
      id: productId,
      name: 'Laptop',
      image: 'laptop.jpg',
      price: 999.99,
      categoryId: 'category-id-1',
      storeId: 'store-id-1',
      isFeatured: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const mockStore = { id: 'store-id-1', ownerId: userId };
    const mockCategory = { id: 'category-id-2', name: 'Electronics' };
    const mockUpdatedProduct = {
      ...mockProduct,
      name: productDto.name,
      image: productDto.image,
      price: productDto.price,
      categoryId: productDto.categoryId,
      storeId: productDto.storeId,
      isFeatured: productDto.isFeatured,
    };

    it('should update a product successfully', async () => {
      mockPrismaService.product.findUnique.mockResolvedValue(mockProduct);
      mockPrismaService.store.findUnique.mockResolvedValue(mockStore);
      mockPrismaService.category.findUnique.mockResolvedValue(mockCategory);
      mockPrismaService.product.update.mockResolvedValue(mockUpdatedProduct);

      const result = await productService.updateProduct(
        productId,
        productDto,
        userId,
      );

      expect(prismaService.product.findUnique).toHaveBeenCalledWith({
        where: { id: productId },
      });
      expect(prismaService.store.findUnique).toHaveBeenCalledWith({
        where: { id: productDto.storeId },
      });
      expect(prismaService.category.findUnique).toHaveBeenCalledWith({
        where: { id: productDto.categoryId },
      });
      expect(prismaService.product.update).toHaveBeenCalledWith({
        where: { id: productId },
        data: {
          name: productDto.name,
          image: productDto.image,
          price: productDto.price,
          categoryId: productDto.categoryId,
          storeId: productDto.storeId,
          isFeatured: productDto.isFeatured,
        },
      });
      expect(result).toEqual({
        message: 'Product updated successfully',
        data: mockUpdatedProduct,
      });
    });

    it('should throw 400 if ID is missing', async () => {
      await expect(
        productService.updateProduct('', productDto, userId),
      ).rejects.toEqual(new CustomError(400, 'Product ID is required'));
      expect(prismaService.product.findUnique).not.toHaveBeenCalled();
    });

    it('should throw 404 if product is not found', async () => {
      mockPrismaService.product.findUnique.mockResolvedValue(null);

      await expect(
        productService.updateProduct(productId, productDto, userId),
      ).rejects.toEqual(new CustomError(404, 'Product not found'));
      expect(prismaService.product.findUnique).toHaveBeenCalledWith({
        where: { id: productId },
      });
      expect(prismaService.product.update).not.toHaveBeenCalled();
    });

    it('should throw 403 if user does not own the product’s store', async () => {
      mockPrismaService.product.findUnique.mockResolvedValue(mockProduct);
      mockPrismaService.store.findUnique.mockResolvedValue({
        ...mockStore,
        ownerId: 'other-user-id',
      });

      await expect(
        productService.updateProduct(productId, productDto, userId),
      ).rejects.toEqual(new CustomError(403, 'You do not own this product'));
      expect(prismaService.product.findUnique).toHaveBeenCalledWith({
        where: { id: productId },
      });
      expect(prismaService.store.findUnique).toHaveBeenCalledWith({
        where: { id: mockProduct.storeId },
      });
      expect(prismaService.product.update).not.toHaveBeenCalled();
    });

    it('should throw 404 if category is not found', async () => {
      mockPrismaService.product.findUnique.mockResolvedValue(mockProduct);
      mockPrismaService.store.findUnique.mockResolvedValue(mockStore);
      mockPrismaService.category.findUnique.mockResolvedValue(null);

      await expect(
        productService.updateProduct(productId, productDto, userId),
      ).rejects.toEqual(new CustomError(404, 'Category not found'));
      expect(prismaService.product.findUnique).toHaveBeenCalledWith({
        where: { id: productId },
      });
      expect(prismaService.category.findUnique).toHaveBeenCalledWith({
        where: { id: productDto.categoryId },
      });
      expect(prismaService.product.update).not.toHaveBeenCalled();
    });

    it('should throw 404 if new store is not found', async () => {
      mockPrismaService.product.findUnique.mockResolvedValue(mockProduct);
      mockPrismaService.store.findUnique
        .mockResolvedValueOnce(mockStore)
        .mockResolvedValueOnce(null);
      mockPrismaService.category.findUnique.mockResolvedValue(mockCategory);

      await expect(
        productService.updateProduct(productId, productDto, userId),
      ).rejects.toEqual(new CustomError(404, 'Store not found'));
      expect(prismaService.product.findUnique).toHaveBeenCalledWith({
        where: { id: productId },
      });
      expect(prismaService.store.findUnique).toHaveBeenCalledWith({
        where: { id: productDto.storeId },
      });
      expect(prismaService.product.update).not.toHaveBeenCalled();
    });

    it('should throw 403 if user does not own the new store', async () => {
      mockPrismaService.product.findUnique.mockResolvedValue(mockProduct);
      mockPrismaService.store.findUnique
        .mockResolvedValueOnce(mockStore)
        .mockResolvedValueOnce({ ...mockStore, ownerId: 'other-user-id' });
      mockPrismaService.category.findUnique.mockResolvedValue(mockCategory);

      await expect(
        productService.updateProduct(productId, productDto, userId),
      ).rejects.toEqual(new CustomError(403, 'You do not own this store'));
      expect(prismaService.product.findUnique).toHaveBeenCalledWith({
        where: { id: productId },
      });
      expect(prismaService.store.findUnique).toHaveBeenCalledWith({
        where: { id: productDto.storeId },
      });
      expect(prismaService.product.update).not.toHaveBeenCalled();
    });

    it('should throw 500 for unexpected errors', async () => {
      mockPrismaService.product.findUnique.mockRejectedValue(
        new Error('Database error'),
      );

      await expect(
        productService.updateProduct(productId, productDto, userId),
      ).rejects.toEqual(new CustomError(500, 'Unexpected error occurred'));
      expect(prismaService.product.findUnique).toHaveBeenCalledWith({
        where: { id: productId },
      });
    });
  });

  describe('deleteProduct', () => {
    const userId = 'user-id-1';
    const productId = 'product-id-1';
    const mockProduct = {
      id: productId,
      name: 'Laptop',
      image: 'laptop.jpg',
      price: 999.99,
      categoryId: 'category-id-1',
      storeId: 'store-id-1',
      isFeatured: true,
      orderItems: [],
      reviews: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const mockStore = { id: 'store-id-1', ownerId: userId };

    it('should delete a product successfully', async () => {
      mockPrismaService.product.findUnique.mockResolvedValue(mockProduct);
      mockPrismaService.store.findUnique.mockResolvedValue(mockStore);
      mockPrismaService.product.delete.mockResolvedValue(mockProduct);

      const result = await productService.deleteProduct(productId, userId);

      expect(prismaService.product.findUnique).toHaveBeenCalledWith({
        where: { id: productId },
        include: {
          orderItems: { select: { id: true } },
          reviews: { select: { id: true } },
        },
      });
      expect(prismaService.store.findUnique).toHaveBeenCalledWith({
        where: { id: mockProduct.storeId },
      });
      expect(prismaService.product.delete).toHaveBeenCalledWith({
        where: { id: productId },
      });
      expect(result).toEqual({
        message: 'Product deleted successfully',
        data: null,
      });
    });

    it('should throw 400 if ID is missing', async () => {
      await expect(productService.deleteProduct('', userId)).rejects.toEqual(
        new CustomError(400, 'Product ID is required'),
      );
      expect(prismaService.product.findUnique).not.toHaveBeenCalled();
    });

    it('should throw 404 if product is not found', async () => {
      mockPrismaService.product.findUnique.mockResolvedValue(null);

      await expect(
        productService.deleteProduct(productId, userId),
      ).rejects.toEqual(new CustomError(404, 'Product not found'));
      expect(prismaService.product.findUnique).toHaveBeenCalledWith({
        where: { id: productId },
        include: expect.any(Object),
      });
      expect(prismaService.product.delete).not.toHaveBeenCalled();
    });

    it('should throw 403 if user does not own the product’s store', async () => {
      mockPrismaService.product.findUnique.mockResolvedValue(mockProduct);
      mockPrismaService.store.findUnique.mockResolvedValue({
        ...mockStore,
        ownerId: 'other-user-id',
      });

      await expect(
        productService.deleteProduct(productId, userId),
      ).rejects.toEqual(new CustomError(403, 'You do not own this product'));
      expect(prismaService.product.findUnique).toHaveBeenCalledWith({
        where: { id: productId },
        include: expect.any(Object),
      });
      expect(prismaService.store.findUnique).toHaveBeenCalledWith({
        where: { id: mockProduct.storeId },
      });
      expect(prismaService.product.delete).not.toHaveBeenCalled();
    });

    it('should throw 400 if product has associated order items', async () => {
      mockPrismaService.product.findUnique.mockResolvedValue({
        ...mockProduct,
        orderItems: [{ id: 'order-item-id-1' }],
      });
      mockPrismaService.store.findUnique.mockResolvedValue(mockStore);

      await expect(
        productService.deleteProduct(productId, userId),
      ).rejects.toEqual(
        new CustomError(
          400,
          'Cannot delete product with associated order items',
        ),
      );
      expect(prismaService.product.findUnique).toHaveBeenCalledWith({
        where: { id: productId },
        include: expect.any(Object),
      });
      expect(prismaService.store.findUnique).toHaveBeenCalledWith({
        where: { id: mockProduct.storeId },
      });
      expect(prismaService.product.delete).not.toHaveBeenCalled();
    });

    it('should throw 400 if product has associated reviews', async () => {
      mockPrismaService.product.findUnique.mockResolvedValue({
        ...mockProduct,
        reviews: [{ id: 'review-id-1' }],
      });
      mockPrismaService.store.findUnique.mockResolvedValue(mockStore);

      await expect(
        productService.deleteProduct(productId, userId),
      ).rejects.toEqual(
        new CustomError(400, 'Cannot delete product with associated reviews'),
      );
      expect(prismaService.product.findUnique).toHaveBeenCalledWith({
        where: { id: productId },
        include: expect.any(Object),
      });
      expect(prismaService.store.findUnique).toHaveBeenCalledWith({
        where: { id: mockProduct.storeId },
      });
      expect(prismaService.product.delete).not.toHaveBeenCalled();
    });

    it('should throw 500 for unexpected errors', async () => {
      mockPrismaService.product.findUnique.mockRejectedValue(
        new Error('Database error'),
      );

      await expect(
        productService.deleteProduct(productId, userId),
      ).rejects.toEqual(new CustomError(500, 'Unexpected error occurred'));
      expect(prismaService.product.findUnique).toHaveBeenCalledWith({
        where: { id: productId },
        include: expect.any(Object),
      });
    });
  });
});
