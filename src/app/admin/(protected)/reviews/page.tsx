import { Star } from "lucide-react";
import { getReviews } from "@/lib/admin/queries";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ReviewRowActions } from "@/components/admin/review-row-actions";

export default async function AdminReviewsPage() {
  const reviews = await getReviews();
  const demoCount = reviews.filter((r) => r.isDemoContent).length;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-heading text-2xl font-medium">Reviews</h1>
        <p className="text-sm text-muted-foreground">
          {reviews.length} review{reviews.length === 1 ? "" : "s"}
          {demoCount > 0 && (
            <>
              {" "}
              — <span className="font-medium text-brand-bronze-600">{demoCount} marked as demo content</span>,
              remove before launch.
            </>
          )}
        </p>
      </div>

      <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-soft">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Reviewer</TableHead>
              <TableHead>Rating</TableHead>
              <TableHead>Review</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="sr-only">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {reviews.map((review) => (
              <TableRow key={review.id}>
                <TableCell>
                  <div className="flex items-center gap-1.5">
                    <span className="font-medium">{review.customerName}</span>
                    {review.isDemoContent && (
                      <Badge variant="outline" className="text-[10px] text-brand-bronze-600">
                        Demo
                      </Badge>
                    )}
                  </div>
                  {review.isVerifiedPurchase && (
                    <span className="text-xs text-brand-emerald-700">Verified purchase</span>
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className="size-3.5"
                        fill={i < review.rating ? "currentColor" : "none"}
                        strokeWidth={1.5}
                        color="var(--color-brand-bronze-600)"
                      />
                    ))}
                  </div>
                </TableCell>
                <TableCell className="max-w-xs">
                  {review.title && <p className="text-sm font-medium">{review.title}</p>}
                  <p className="line-clamp-2 text-xs text-muted-foreground">{review.body}</p>
                </TableCell>
                <TableCell className="whitespace-nowrap text-sm text-muted-foreground">
                  {new Date(review.createdAt).toLocaleDateString("en-AE", {
                    day: "numeric",
                    month: "short",
                  })}
                </TableCell>
                <TableCell>
                  <Badge
                    className={
                      review.isPublished
                        ? "bg-brand-emerald-100 text-brand-emerald-900 border-transparent"
                        : "bg-muted text-muted-foreground border-transparent"
                    }
                  >
                    {review.isPublished ? "Published" : "Hidden"}
                  </Badge>
                </TableCell>
                <TableCell>
                  <ReviewRowActions
                    reviewId={review.id}
                    isPublished={review.isPublished}
                    isVerifiedPurchase={review.isVerifiedPurchase}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
