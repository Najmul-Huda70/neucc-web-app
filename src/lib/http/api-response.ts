export function ok<T>(data: T, init?: ResponseInit) {
  return Response.json({ data }, init);
}

export function collection<T>(data: T[], pagination: {
  page: number;
  pageSize: number;
  total: number;
}) {
  return Response.json({
    data,
    pagination: {
      ...pagination,
      totalPages: Math.ceil(pagination.total / pagination.pageSize),
    },
  });
}

export function apiError(
  status: number,
  code: string,
  message: string,
  details?: unknown,
) {
  return Response.json(
    { error: { code, message, ...(details === undefined ? {} : { details }) } },
    { status },
  );
}

export function unexpectedError() {
  return apiError(500, 'INTERNAL_ERROR', 'An unexpected error occurred.');
}
