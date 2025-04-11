import { supabase } from '@/integrations/supabase/client';
import { Tables, TablesInsert, TablesUpdate } from '@/integrations/supabase/types';
import { Json } from '@/integrations/supabase/types';

// Extended types for reviews and related entities with additional fields needed by UI
export interface CourseReview {
  id: string;
  course_id: string;
  user_id: string;
  rating: number;
  title: string; // Added field required by UI
  comment: string;
  created_at: string;
  updated_at: string;
  is_verified?: boolean; // Added field required by UI
  is_featured?: boolean; // Added field required by UI
  user?: { // Added field required by UI
    id: string;
    full_name?: string;
    avatar_url?: string;
  };
  reactions?: ReviewReaction[]; // Added field required by UI
}

export interface ReviewReaction {
  review_id: string;
  user_id: string;
  reaction_type: 'helpful' | 'unhelpful';
  created_at: string;
}

export interface ReviewComment {
  id: string;
  review_id: string;
  user_id: string;
  parent_id?: string;
  comment: string;
  created_at: string;
  updated_at: string;
  is_deleted: boolean;
  user?: {
    id: string;
    name?: string;
    avatar_url?: string;
  };
}

export interface CourseReviewMetrics {
  course_id: string;
  total_reviews: number;
  avg_rating: number;
  rating_counts: { [key: string]: number };
  last_updated: string;
}

// Type for inserting new review
export interface CourseReviewInsert {
  course_id: string;
  user_id: string;
  rating: number;
  title: string;
  comment: string;
  is_verified?: boolean;
  is_featured?: boolean;
}

// Type for inserting new comment
export type ReviewCommentInsert = {
  review_id: string;
  user_id: string;
  parent_id?: string;
  comment: string;
};

// Type for reações
export type ReactionType = 'helpful' | 'unhelpful';

// Type for filtering and sorting reviews
export interface ReviewListOptions {
  courseId: string;
  limit?: number;
  page?: number;
  sortBy?: 'date' | 'rating' | 'helpful';
  sortOrder?: 'asc' | 'desc';
  ratingFilter?: number[];
  verifiedOnly?: boolean;
}

// Interface for pagination
export interface PaginationResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/**
 * Service for managing course reviews and comments
 */
class ReviewService {
  /**
   * Creates a new review for a course
   */
  async createReview(data: CourseReviewInsert): Promise<CourseReview> {
    const { data: review, error } = await supabase
      .from('course_reviews')
      .insert(data)
      .select('*')
      .single();

    if (error) {
      console.error('Error creating review:', error);
      throw new Error(`Failed to create review: ${error.message}`);
    }

    return review as CourseReview;
  }

  /**
   * Gets a specific review by ID
   */
  async getReviewById(reviewId: string): Promise<CourseReview | null> {
    const { data, error } = await supabase
      .from('course_reviews')
      .select(`
        *,
        user:profiles(id, name:full_name, avatar_url),
        reactions:review_reactions(id, user_id, reaction_type)
      `)
      .eq('id', reviewId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // Not found
      }
      console.error('Error fetching review:', error);
      throw new Error(`Failed to fetch review: ${error.message}`);
    }

    return data as CourseReview;
  }

  /**
   * Updates an existing review
   */
  async updateReview(reviewId: string, updates: Partial<CourseReview>): Promise<CourseReview> {
    const { data: review, error } = await supabase
      .from('course_reviews')
      .update(updates)
      .eq('id', reviewId)
      .select('*')
      .single();

    if (error) {
      console.error('Error updating review:', error);
      throw new Error(`Failed to update review: ${error.message}`);
    }

    return review as CourseReview;
  }

  /**
   * Deletes a review
   */
  async deleteReview(reviewId: string): Promise<boolean> {
    const { error } = await supabase
      .from('course_reviews')
      .delete()
      .eq('id', reviewId);

    if (error) {
      console.error('Error deleting review:', error);
      throw new Error(`Failed to delete review: ${error.message}`);
    }

    return true;
  }

  /**
   * Lists reviews for a course with pagination and filters
   */
  async listCourseReviews(options: ReviewListOptions): Promise<PaginationResult<CourseReview>> {
    const {
      courseId,
      limit = 10,
      page = 1,
      sortBy = 'date',
      sortOrder = 'desc',
      ratingFilter,
      verifiedOnly = false
    } = options;

    // Calculate offset for pagination
    const offset = (page - 1) * limit;

    try {
      // Start the query
      let query = supabase
        .from('course_reviews')
        .select(`
          *,
          user:profiles(id, full_name, avatar_url),
          reactions:review_reactions(id, user_id, reaction_type)
        `, { count: 'exact' })
        .eq('course_id', courseId);

      // Apply additional filters
      if (verifiedOnly) {
        query = query.eq('is_verified', true);
      }

      if (ratingFilter && ratingFilter.length > 0) {
        query = query.in('rating', ratingFilter);
      }

      // Apply sorting
      if (sortBy === 'date') {
        query = query.order('created_at', { ascending: sortOrder === 'asc' });
      } else if (sortBy === 'rating') {
        query = query.order('rating', { ascending: sortOrder === 'asc' });
      } else if (sortBy === 'helpful') {
        // This would ideally be a more complex query that counts helpful reactions
        query = query.order('created_at', { ascending: false });
      }

      // Apply pagination
      query = query.range(offset, offset + limit - 1);

      // Execute the query
      const { data, error, count } = await query;

      if (error) {
        console.error('Error listing reviews:', error);
        throw error;
      }

      // Calculate total pages
      const totalPages = count ? Math.ceil(count / limit) : 0;

      return {
        data: data as CourseReview[],
        total: count || 0,
        page,
        limit,
        totalPages
      };
    } catch (error) {
      console.error('Error in listCourseReviews:', error);
      throw error;
    }
  }

  /**
   * Gets review metrics for a course
   */
  async getCourseReviewMetrics(courseId: string): Promise<CourseReviewMetrics | null> {
    try {
      // This would typically be provided by a dedicated view or function
      // For now, we'll calculate metrics on the fly
      const { data: reviews, error, count } = await supabase
        .from('course_reviews')
        .select('rating', { count: 'exact' })
        .eq('course_id', courseId);

      if (error) {
        console.error('Error fetching review metrics:', error);
        throw error;
      }

      if (!reviews || reviews.length === 0) {
        return {
          course_id: courseId,
          total_reviews: 0,
          avg_rating: 0,
          rating_counts: { '1': 0, '2': 0, '3': 0, '4': 0, '5': 0 },
          last_updated: new Date().toISOString()
        };
      }

      // Calculate average rating
      const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
      const avgRating = sum / reviews.length;

      // Calculate rating counts
      const ratingCounts: { [key: string]: number } = { '1': 0, '2': 0, '3': 0, '4': 0, '5': 0 };
      reviews.forEach(review => {
        const ratingKey = review.rating.toString();
        ratingCounts[ratingKey] = (ratingCounts[ratingKey] || 0) + 1;
      });

      return {
        course_id: courseId,
        total_reviews: count || reviews.length,
        avg_rating,
        rating_counts: ratingCounts,
        last_updated: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error in getCourseReviewMetrics:', error);
      return null;
    }
  }

  /**
   * Adds a comment to a review
   */
  async addComment(data: ReviewCommentInsert): Promise<ReviewComment> {
    try {
      const { data: comment, error } = await supabase
        .from('review_comments')
        .insert(data)
        .select(`
          *,
          user:profiles(id, name, avatar_url)
        `)
        .single();

      if (error) {
        console.error('Error adding comment:', error);
        throw error;
      }

      return comment as unknown as ReviewComment;
    } catch (error) {
      console.error('Error in addComment:', error);
      throw error;
    }
  }

  /**
   * Gets comments for a review
   */
  async getReviewComments(reviewId: string): Promise<ReviewComment[]> {
    try {
      const { data, error } = await supabase
        .from('review_comments')
        .select(`
          *,
          user:profiles(id, name, avatar_url)
        `)
        .eq('review_id', reviewId)
        .is('parent_id', null) // Only root comments
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching comments:', error);
        throw error;
      }

      return data as unknown as ReviewComment[];
    } catch (error) {
      console.error('Error in getReviewComments:', error);
      return [];
    }
  }

  /**
   * Marks a comment as deleted (soft delete)
   */
  async deleteComment(commentId: string): Promise<ReviewComment> {
    try {
      const { data: comment, error } = await supabase
        .from('review_comments')
        .update({ is_deleted: true })
        .eq('id', commentId)
        .select('*')
        .single();

      if (error) {
        console.error('Error deleting comment:', error);
        throw error;
      }

      return comment as unknown as ReviewComment;
    } catch (error) {
      console.error('Error in deleteComment:', error);
      throw error;
    }
  }

  /**
   * Adds or updates a reaction to a review
   */
  async addReaction(reviewId: string, userId: string, reactionType: ReactionType): Promise<ReviewReaction> {
    try {
      // Check if user already reacted to this review
      const { data: existingReaction } = await supabase
        .from('review_reactions')
        .select('*')
        .eq('review_id', reviewId)
        .eq('user_id', userId)
        .maybeSingle();

      if (existingReaction) {
        // If reaction exists, update it
        const { data: reaction, error } = await supabase
          .from('review_reactions')
          .update({ reaction_type: reactionType })
          .eq('id', existingReaction.id)
          .select('*')
          .single();

        if (error) {
          console.error('Error updating reaction:', error);
          throw error;
        }

        return reaction as unknown as ReviewReaction;
      } else {
        // Otherwise, create new reaction
        const { data: reaction, error } = await supabase
          .from('review_reactions')
          .insert({
            review_id: reviewId,
            user_id: userId,
            reaction_type: reactionType
          })
          .select('*')
          .single();

        if (error) {
          console.error('Error adding reaction:', error);
          throw error;
        }

        return reaction as unknown as ReviewReaction;
      }
    } catch (error) {
      console.error('Error in addReaction:', error);
      throw error;
    }
  }

  /**
   * Removes a reaction from a review
   */
  async removeReaction(reviewId: string, userId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('review_reactions')
        .delete()
        .eq('review_id', reviewId)
        .eq('user_id', userId);

      if (error) {
        console.error('Error removing reaction:', error);
        throw error;
      }

      return true;
    } catch (error) {
      console.error('Error in removeReaction:', error);
      throw error;
    }
  }

  /**
   * Checks if user has already reviewed a course
   */
  async getUserReviewForCourse(courseId: string, userId: string): Promise<CourseReview | null> {
    try {
      const { data, error } = await supabase
        .from('course_reviews')
        .select('*')
        .eq('course_id', courseId)
        .eq('user_id', userId)
        .maybeSingle();

      if (error) {
        console.error('Error checking user review:', error);
        throw error;
      }

      return data as CourseReview;
    } catch (error) {
      console.error('Error in getUserReviewForCourse:', error);
      throw error;
    }
  }

  /**
   * Reports a review or comment
   */
  async reportContent(reportData: {
    reviewId?: string;
    commentId?: string;
    reporterId: string;
    reason: string;
    details?: string;
  }): Promise<string> {
    try {
      const { reviewId, commentId, reporterId, reason, details } = reportData;

      if (!reviewId && !commentId) {
        throw new Error('You must provide either reviewId or commentId');
      }

      // Using a custom table for reports
      const { data, error } = await supabase
        .from('review_reports')
        .insert({
          review_id: reviewId || null,
          comment_id: commentId || null,
          reporter_id: reporterId,
          reason,
          details: details || null,
          status: 'pending'
        })
        .select('id')
        .single();

      if (error) {
        console.error('Error reporting content:', error);
        throw error;
      }

      return data.id;
    } catch (error) {
      console.error('Error in reportContent:', error);
      throw error;
    }
  }

  /**
   * Checks if user can review a course
   * (user must be enrolled)
   */
  async canReviewCourse(courseId: string, userId: string): Promise<boolean> {
    try {
      // Check if user is enrolled in the course
      const { data, error } = await supabase
        .from('enrollments')
        .select('id')
        .eq('course_id', courseId)
        .eq('user_id', userId)
        .maybeSingle();

      if (error) {
        console.error('Error checking enrollment:', error);
        throw error;
      }

      return !!data;
    } catch (error) {
      console.error('Error in canReviewCourse:', error);
      throw error;
    }
  }
}

// Export service instance
export const reviewService = new ReviewService();

// Also export the class for testing and special cases
export { ReviewService };
