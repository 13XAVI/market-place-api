import { Test, TestingModule } from '@nestjs/testing';
import { CategoryService } from './category.service';
import { PrismaService } from '../prisma/prisma.service';
import { CustomError } from '../utils/customClass';
import { CategoryDto } from '../dtos';

describe('CategoryService', () => {
  let categoryService: CategoryService;
  let prismaService: PrismaService;

  const mockPrismaService = {
    category: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CategoryService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    categoryService = module.get<CategoryService>(CategoryService);
    prismaService = module.get<PrismaService>(PrismaService);

    jest.clearAllMocks();
  });

  describe('createCategory', () => {
    const categoryDto: CategoryDto = {
      name: 'Electronics',
      description: 'Electronic products',
    };

    const mockCategory = {
      id: 'category-id-1',
      name: 'ELECTRONICS',
      description: 'Electronic products',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    it('should create a category successfully', async () => {
      mockPrismaService.category.findUnique.mockResolvedValue(null);
      mockPrismaService.category.create.mockResolvedValue(mockCategory);

      const result = await categoryService.createCategory(categoryDto);

      expect(prismaService.category.findUnique).toHaveBeenCalledWith({
        where: { name: categoryDto.name.toUpperCase() },
      });
      expect(prismaService.category.create).toHaveBeenCalledWith({
        data: {
          name: categoryDto.name.toUpperCase(),
          description: categoryDto.description,
        },
      });
      expect(result).toEqual({
        message: 'Category created successfully',
        data: mockCategory,
      });
    });

    it('should throw 400 if category name is missing', async () => {
      const invalidDto = { ...categoryDto, name: '' };

      await expect(categoryService.createCategory(invalidDto)).rejects.toEqual(
        new CustomError(400, 'Category name is required'),
      );
      expect(prismaService.category.findUnique).not.toHaveBeenCalled();
    });

    it('should throw 400 if category already exists', async () => {
      mockPrismaService.category.findUnique.mockResolvedValue(mockCategory);

      await expect(categoryService.createCategory(categoryDto)).rejects.toEqual(
        new CustomError(400, 'Category already exists'),
      );
      expect(prismaService.category.findUnique).toHaveBeenCalledWith({
        where: { name: categoryDto.name.toUpperCase() },
      });
      expect(prismaService.category.create).not.toHaveBeenCalled();
    });

    it('should throw 500 for unexpected errors', async () => {
      mockPrismaService.category.findUnique.mockRejectedValue(
        new Error('Database error'),
      );

      await expect(categoryService.createCategory(categoryDto)).rejects.toEqual(
        new CustomError(500, 'Unexpected error occurred'),
      );
      expect(prismaService.category.findUnique).toHaveBeenCalledWith({
        where: { name: categoryDto.name.toUpperCase() },
      });
    });
  });

  describe('updateCategory', () => {
    const categoryDto: CategoryDto = {
      name: 'Electronics',
      description: 'Updated electronic products',
    };

    const mockCategory = {
      id: 'category-id-1',
      name: 'ELECTRONICS',
      description: 'Electronic products',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    it('should update a category successfully', async () => {
      mockPrismaService.category.findUnique.mockResolvedValue(mockCategory);
      mockPrismaService.category.update.mockResolvedValue({
        ...mockCategory,
        name: categoryDto.name.toUpperCase(),
        description: categoryDto.description,
      });

      const result = await categoryService.updateCategory(
        'category-id-1',
        categoryDto,
      );

      expect(prismaService.category.findUnique).toHaveBeenCalledWith({
        where: { id: 'category-id-1' },
      });
      expect(prismaService.category.update).toHaveBeenCalledWith({
        where: { id: 'category-id-1' },
        data: {
          name: categoryDto.name.toUpperCase(),
          description: categoryDto.description,
        },
      });
      expect(result).toEqual({
        message: 'Category updated successfully',
        data: expect.objectContaining({
          name: 'ELECTRONICS',
          description: 'Updated electronic products',
        }),
      });
    });

    it('should throw 400 if category name is missing', async () => {
      const invalidDto = { ...categoryDto, name: '' };

      await expect(
        categoryService.updateCategory('category-id-1', invalidDto),
      ).rejects.toEqual(new CustomError(400, 'Category name is required'));
      expect(prismaService.category.findUnique).not.toHaveBeenCalled();
    });

    it('should throw 404 if category is not found', async () => {
      mockPrismaService.category.findUnique.mockResolvedValue(null);

      await expect(
        categoryService.updateCategory('category-id-1', categoryDto),
      ).rejects.toEqual(new CustomError(404, 'Category not found'));
      expect(prismaService.category.findUnique).toHaveBeenCalledWith({
        where: { id: 'category-id-1' },
      });
      expect(prismaService.category.update).not.toHaveBeenCalled();
    });

    it('should throw 500 for unexpected errors', async () => {
      mockPrismaService.category.findUnique.mockRejectedValue(
        new Error('Database error'),
      );

      await expect(
        categoryService.updateCategory('category-id-1', categoryDto),
      ).rejects.toEqual(new CustomError(500, 'Unexpected error occurred'));
      expect(prismaService.category.findUnique).toHaveBeenCalledWith({
        where: { id: 'category-id-1' },
      });
    });
  });

  describe('OneCategory', () => {
    const mockCategory = {
      id: 'category-id-1',
      name: 'ELECTRONICS',
      description: 'Electronic products',
      createdAt: new Date(),
      updatedAt: new Date(),
      products: [
        {
          id: 'product-id-1',
          name: 'Laptop',
          price: 999.99,
          isFeatured: true,
          createdAt: new Date(),
        },
      ],
    };

    it('should retrieve a category by ID successfully', async () => {
      mockPrismaService.category.findUnique.mockResolvedValue(mockCategory);

      const result = await categoryService.OneCategory('category-id-1');

      expect(prismaService.category.findUnique).toHaveBeenCalledWith({
        where: { id: 'category-id-1' },
        include: {
          products: {
            select: {
              id: true,
              name: true,
              price: true,
              isFeatured: true,
              createdAt: true,
            },
          },
        },
      });
      expect(result).toEqual({
        message: 'Category retrieved successfully',
        data: mockCategory,
      });
    });

    it('should throw 400 if ID is missing', async () => {
      await expect(categoryService.OneCategory('')).rejects.toEqual(
        new CustomError(400, 'Category ID is required'),
      );
      expect(prismaService.category.findUnique).not.toHaveBeenCalled();
    });

    it('should throw 404 if category is not found', async () => {
      mockPrismaService.category.findUnique.mockResolvedValue(null);

      await expect(
        categoryService.OneCategory('category-id-1'),
      ).rejects.toEqual(new CustomError(404, 'Category not found'));
      expect(prismaService.category.findUnique).toHaveBeenCalledWith({
        where: { id: 'category-id-1' },
        include: {
          products: {
            select: {
              id: true,
              name: true,
              price: true,
              isFeatured: true,
              createdAt: true,
            },
          },
        },
      });
    });

    it('should throw 500 for unexpected errors', async () => {
      mockPrismaService.category.findUnique.mockRejectedValue(
        new Error('Database error'),
      );

      await expect(
        categoryService.OneCategory('category-id-1'),
      ).rejects.toEqual(new CustomError(500, 'Unexpected error occurred'));
      expect(prismaService.category.findUnique).toHaveBeenCalledWith({
        where: { id: 'category-id-1' },
        include: {
          products: {
            select: {
              id: true,
              name: true,
              price: true,
              isFeatured: true,
              createdAt: true,
            },
          },
        },
      });
    });
  });

  describe('AllCategory', () => {
    const mockCategories = [
      {
        id: 'category-id-1',
        name: 'ELECTRONICS',
        description: 'Electronic products',
        createdAt: new Date(),
      },
      {
        id: 'category-id-2',
        name: 'CLOTHING',
        description: 'Clothing items',
        createdAt: new Date(),
      },
    ];

    it('should retrieve all categories successfully', async () => {
      mockPrismaService.category.findMany.mockResolvedValue(mockCategories);

      const result = await categoryService.AllCategory();

      expect(prismaService.category.findMany).toHaveBeenCalledWith({
        select: {
          id: true,
          name: true,
          description: true,
          createdAt: true,
        },
      });
      expect(result).toEqual({
        message: 'Categories retrieved successfully',
        data: mockCategories,
      });
    });

    it('should return empty array if no categories exist', async () => {
      mockPrismaService.category.findMany.mockResolvedValue([]);

      const result = await categoryService.AllCategory();

      expect(prismaService.category.findMany).toHaveBeenCalledWith({
        select: {
          id: true,
          name: true,
          description: true,
          createdAt: true,
        },
      });
      expect(result).toEqual({
        message: 'Categories retrieved successfully',
        data: [],
      });
    });

    it('should throw 500 for unexpected errors', async () => {
      mockPrismaService.category.findMany.mockRejectedValue(
        new Error('Database error'),
      );

      await expect(categoryService.AllCategory()).rejects.toEqual(
        new CustomError(500, 'Unexpected error occurred'),
      );
      expect(prismaService.category.findMany).toHaveBeenCalledWith({
        select: {
          id: true,
          name: true,
          description: true,
          createdAt: true,
        },
      });
    });
  });

  describe('deleteCategory', () => {
    const mockCategory = {
      id: 'category-id-1',
      name: 'ELECTRONICS',
      description: 'Electronic products',
      createdAt: new Date(),
      updatedAt: new Date(),
      products: [],
    };

    it('should delete a category successfully', async () => {
      mockPrismaService.category.findUnique.mockResolvedValue(mockCategory);
      mockPrismaService.category.delete.mockResolvedValue(mockCategory);

      const result = await categoryService.deleteCategory('category-id-1');

      expect(prismaService.category.findUnique).toHaveBeenCalledWith({
        where: { id: 'category-id-1' },
        include: { products: { select: { id: true } } },
      });
      expect(prismaService.category.delete).toHaveBeenCalledWith({
        where: { id: 'category-id-1' },
      });
      expect(result).toEqual({
        message: 'Category deleted successfully',
        data: null,
      });
    });

    it('should throw 400 if ID is missing', async () => {
      await expect(categoryService.deleteCategory('')).rejects.toEqual(
        new CustomError(400, 'Category ID is required'),
      );
      expect(prismaService.category.findUnique).not.toHaveBeenCalled();
    });

    it('should throw 404 if category is not found', async () => {
      mockPrismaService.category.findUnique.mockResolvedValue(null);

      await expect(
        categoryService.deleteCategory('category-id-1'),
      ).rejects.toEqual(new CustomError(404, 'Category not found'));
      expect(prismaService.category.findUnique).toHaveBeenCalledWith({
        where: { id: 'category-id-1' },
        include: { products: { select: { id: true } } },
      });
      expect(prismaService.category.delete).not.toHaveBeenCalled();
    });

    it('should throw 400 if category has associated products', async () => {
      mockPrismaService.category.findUnique.mockResolvedValue({
        ...mockCategory,
        products: [{ id: 'product-id-1' }],
      });

      await expect(
        categoryService.deleteCategory('category-id-1'),
      ).rejects.toEqual(
        new CustomError(400, 'Cannot delete category with associated products'),
      );
      expect(prismaService.category.findUnique).toHaveBeenCalledWith({
        where: { id: 'category-id-1' },
        include: { products: { select: { id: true } } },
      });
      expect(prismaService.category.delete).not.toHaveBeenCalled();
    });

    it('should throw 500 for unexpected errors', async () => {
      mockPrismaService.category.findUnique.mockRejectedValue(
        new Error('Database error'),
      );

      await expect(
        categoryService.deleteCategory('category-id-1'),
      ).rejects.toEqual(new CustomError(500, 'Unexpected error occurred'));
      expect(prismaService.category.findUnique).toHaveBeenCalledWith({
        where: { id: 'category-id-1' },
        include: { products: { select: { id: true } } },
      });
    });
  });
});
