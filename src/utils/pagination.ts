import { IPage } from './dto'

interface PaginateArgs {
  include?: any
}

export async function paginate<TModel, TFindManyArgs extends PaginateArgs>(
  model: any,
  args: Omit<TFindManyArgs, 'take' | 'skip'>,
  page = 0,
  size = 10
): Promise<IPage<TModel>> {
  const { include, ...argsCopy } = args
  const items = (await model.findMany({
    ...argsCopy,
    take: size,
    skip: size * page,
  })) as TModel[]

  const totalItems = await model.count(argsCopy)

  return {
    items,
    totalItems,
    itemCount: items.length,
    itemsPerPage: size,
    totalPages: Math.ceil(totalItems / size),
    currentPage: page,
  }
}
