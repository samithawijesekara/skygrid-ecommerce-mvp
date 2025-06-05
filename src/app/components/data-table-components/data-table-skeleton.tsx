import {
  TableCell,
  TableRow,
  TableHeader,
  Table,
  TableBody,
} from "../ui/table";
import { Skeleton } from "../ui/skeleton";

interface TableSkeletonProps {
  columnCount?: number;
  rowCount?: number;
  isTableHeader?: boolean;
}

export function TableSkeleton({
  columnCount = 6,
  rowCount = 5,
  isTableHeader = true,
}: TableSkeletonProps) {
  return (
    <div className="w-full space-y-4">
      {/* Search and Filters Section */}
      <div className="hidden items-center justify-between">
        <div className="flex flex-1 items-center space-x-2">
          {/* Search Input */}
          <Skeleton className="h-9 w-[250px]" />
          {/* Filter Buttons */}
          <Skeleton className="h-8 w-[100px]" />
          <Skeleton className="h-8 w-[100px]" />
          <Skeleton className="h-8 w-[70px]" />
        </div>
        {/* Invite User Button */}
        <Skeleton className="h-9 w-[120px]" />
      </div>

      {/* Table Section */}
      <div className="rounded-md border">
        <div className="relative w-full overflow-auto">
          <Table>
            {isTableHeader && (
              <TableHeader>
                <TableRow>
                  {[...Array(columnCount)].map((_, index) => (
                    <TableCell key={`header-${index}`} className="py-4">
                      <Skeleton className="h-4 w-[100px]" />
                    </TableCell>
                  ))}
                </TableRow>
              </TableHeader>
            )}
            <TableBody>
              {[...Array(rowCount)].map((_, rowIndex) => (
                <TableRow key={`row-${rowIndex}`}>
                  {[...Array(columnCount)].map((_, colIndex) => (
                    <TableCell
                      key={`cell-${rowIndex}-${colIndex}`}
                      className="py-4"
                    >
                      <Skeleton className="h-8 w-[100px]" />
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Pagination Skeleton */}
      <div className="flex items-center justify-between px-2">
        <Skeleton className="h-8 w-[100px]" />
        <div className="flex items-center space-x-2">
          <Skeleton className="h-8 w-[100px]" />
          <Skeleton className="h-8 w-[70px]" />
        </div>
      </div>
    </div>
  );
}
