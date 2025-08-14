import {
  pgTable,
  varchar,
  text,
  timestamp,
  uuid,
  integer,
  json,
  pgEnum,
  boolean,
  index,
  date,
} from "drizzle-orm/pg-core";

// =====================
// ENUM DEFINITIONS
// =====================
export const authUserRole = pgEnum("auth_user_role", [
  "admin",
  "trainer",
  "trainee",
  "user",
]);
export const userStatus = pgEnum("user_status", [
  "active",
  "inactive",
  "banned",
]);
export const registrationStatus = pgEnum("registration_status", [
  "pending",
  "approved",
  "rejected",
]);
export const blogStatus = pgEnum("blog_status", ["draft", "published"]);
export const contactType = pgEnum("contact_type", ["message", "booking"]);
export const contactStatus = pgEnum("contact_status", [
  "unread",
  "in_progress",
  "replied",
  "archived",
]);
export const priorityLevel = pgEnum("priority_level", [
  "high",
  "medium",
  "low",
]);
export const notificationStatus = pgEnum("notification_status", [
  "read",
  "unread",
]);
export const courseLevel = pgEnum("course_level", [
  "beginner",
  "intermediate",
  "expert",
]);
export const courseStatus = pgEnum("course_status", [
  "Draft",
  "Published",
  "Archived",
]);
export const contentType = pgEnum("content_type", ["Video", "Text", "Quiz"]);
export const assessmentType = pgEnum("assessment_type", [
  "Quiz",
  "Exam",
  "Assignment",
]);
export const deliveryMode = pgEnum("delivery_mode", [
  "self_paced",
  "live",
  "hybrid",
]);

// =====================
// AUTH USER TABLE
// =====================
export const authUsers = pgTable(
  "auth_users",
  {
    userId: uuid("user_id").defaultRandom().primaryKey(),
    firstName: varchar("first_name", { length: 255 }).default("abc").notNull(),
    lastName: varchar("last_name", { length: 255 }).default("def").notNull(),
    email: varchar("email", { length: 255 }).unique().notNull(),
    passwordHash: varchar("password_hash", { length: 255 }).notNull(),
    role: authUserRole("role").default("trainee").notNull(),
    clerkId: varchar("clerk_id", { length: 255 }).notNull().unique(),
    profileImageUrl: varchar("profile_image_url", { length: 500 }),

    isActive: boolean("is_active").default(true).notNull(),
    isVerified: boolean("is_verified").default(false).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
    lastLogin: timestamp("last_login", { withTimezone: true }),
  },
  (table) => ({
    emailIdx: index("idx_auth_users_email").on(table.email),
  })
);

// =====================
// CARBON TOPIC TABLE
// =====================
export const carbonTopics = pgTable("carbon_topics", {
  topicId: uuid("topic_id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
});

// =====================
// COURSE TABLE
// =====================
export const courses = pgTable(
  "courses",
  {
    courseId: uuid("course_id").defaultRandom().primaryKey(),
    title: varchar("title", { length: 255 }).notNull(),
    description: text("description"),
    carbonAccountingFocus: boolean("carbon_accounting_focus").default(false),
    carbonTopicId: uuid("carbon_topic_id").references(
      () => carbonTopics.topicId
    ),
    duration: varchar("duration", { length: 255 }), // e.g., "1 day (8 hours)"
    price: varchar("price", { length: 50 }), // e.g., "€199 or 199 TND"
    whyThisCourse: text("why_this_course"), // Reason/benefit text

    level: courseLevel("level").notNull(),
    creationDate: timestamp("creation_date", {
      withTimezone: true,
    }).defaultNow(),
    lastUpdated: timestamp("last_updated", { withTimezone: true }).defaultNow(),
    status: courseStatus("status").default("Draft").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
  },
  (table) => ({
    titleIdx: index("idx_courses_title").on(table.title),
    carbonTopicIdx: index("idx_courses_carbon_topic_id").on(
      table.carbonTopicId
    ),
  })
);
export const blogposts = pgTable(
  "blogposts",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    title: varchar("title", { length: 255 }).notNull(),
    slug: varchar("slug", { length: 255 }).unique().notNull(),
    content: text("content"),
    authorId: uuid("author_id").references(() => authUsers.userId, {
      onDelete: "set null",
    }),
    publishDate: timestamp("publish_date"),
    status: blogStatus("status").default("draft").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
  },
  (table) => ({
    slugIdx: index("idx_blogposts_slug").on(table.slug),
    authorIdx: index("idx_blogposts_author").on(table.authorId),
  })
);

// =====================
// COURSE PREREQUISITES JOIN TABLE
// =====================
export const coursePrerequisites = pgTable("course_prerequisites", {
  courseId: uuid("course_id")
    .references(() => courses.courseId, { onDelete: "cascade" })
    .notNull(),
  prerequisiteCourseId: uuid("prerequisite_course_id")
    .references(() => courses.courseId, { onDelete: "cascade" })
    .notNull(),
});

// =====================
// MODULE TABLE
// =====================
export const modules = pgTable(
  "modules",
  {
    moduleId: uuid("module_id").defaultRandom().primaryKey(),
    courseId: uuid("course_id")
      .references(() => courses.courseId, { onDelete: "cascade" })
      .notNull(),
    title: varchar("title", { length: 255 }).notNull(),
    content: text("content"),
    contentType: contentType("content_type").notNull(),
    order: integer("order").notNull(),
    estimatedDuration: integer("estimated_duration"), // in minutes
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
  },
  (table) => ({
    courseIdIdx: index("idx_modules_course_id").on(table.courseId),
    orderIdx: index("idx_modules_order").on(table.order),
  })
);

// =====================
// ASSESSMENT TABLE
// =====================
export const assessments = pgTable(
  "assessments",
  {
    assessmentId: uuid("assessment_id").defaultRandom().primaryKey(),
    moduleId: uuid("module_id")
      .references(() => modules.moduleId, { onDelete: "cascade" })
      .notNull(),
    assessmentType: assessmentType("assessment_type").notNull(),
    maxScore: integer("max_score").notNull(),
    passingScore: integer("passing_score").notNull(),
    timeLimit: integer("time_limit"), // in minutes
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
  },
  (table) => ({
    moduleIdIdx: index("idx_assessments_module_id").on(table.moduleId),
  })
);

// =====================
// QUESTION TABLE
// =====================
export const questions = pgTable(
  "questions",
  {
    questionId: uuid("question_id").defaultRandom().primaryKey(),
    assessmentId: uuid("assessment_id")
      .references(() => assessments.assessmentId, { onDelete: "cascade" })
      .notNull(),
    text: text("text").notNull(),
    options: json("options"),
    correctAnswer: varchar("correct_answer", { length: 255 }),
    explanation: text("explanation"),
    order: integer("order"),
  },
  (table) => ({
    assessmentIdIdx: index("idx_questions_assessment_id").on(
      table.assessmentId
    ),
  })
);

// =====================
// CERTIFICATE TABLE
// =====================
export const certificates = pgTable(
  "certificates",
  {
    certificateId: uuid("certificate_id").defaultRandom().primaryKey(),

    userId: uuid("user_id")
      .references(() => authUsers.userId, { onDelete: "cascade" })
      .notNull(),

    courseId: uuid("course_id")
      .references(() => courses.courseId, { onDelete: "cascade" })
      .notNull(),

    fullName: varchar("full_name", { length: 255 }).notNull(), // From Canva content

    title: varchar("title", { length: 255 }).notNull(), // e.g., "Introduction to Life Cycle Assessment"
    description: text("description").notNull(), // Course paragraph from certificate

    courseStartDate: date("course_start_date").notNull(),
    courseEndDate: date("course_end_date").notNull(),

    issueDate: timestamp("issue_date", { withTimezone: true }).notNull(),
    validUntil: timestamp("valid_until", { withTimezone: true }),

    issuerName: varchar("issuer_name", { length: 255 }).default(
      "Ussama Ben Abdessalem"
    ),
    issuerRole: varchar("issuer_role", { length: 255 }).default(
      "CEO of Carbon Jar"
    ),

    certificateCode: varchar("certificate_code", { length: 32 })
      .unique()
      .notNull(), // e.g., "0164"
    certificateSlug: varchar("certificate_slug", { length: 255 })
      .unique()
      .notNull(), // e.g., "molk-souli-intro-to-lca"

    pdfUrl: varchar("pdf_url", { length: 512 }).default(""), // URL to the PDF certificate

    certificateHash: varchar("certificate_hash", { length: 255 }).notNull(),

    isRevoked: boolean("is_revoked").default(false),
    revokedReason: text("revoked_reason"),

    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
  },
  (table) => ({
    userIdIdx: index("idx_certificates_user_id").on(table.userId),
    courseIdIdx: index("idx_certificates_course_id").on(table.courseId),
    hashIdx: index("idx_certificates_hash").on(table.certificateHash),
    slugIdx: index("idx_certificates_slug").on(table.certificateSlug),
    codeIdx: index("idx_certificates_code").on(table.certificateCode),
  })
);

// =====================
// ENROLLMENT TABLE
// =====================
export const enrollments = pgTable(
  "enrollments",
  {
    enrollmentId: uuid("enrollment_id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .references(() => authUsers.userId, { onDelete: "cascade" })
      .notNull(),
    courseId: uuid("course_id")
      .references(() => courses.courseId, { onDelete: "cascade" })
      .notNull(),
    enrollmentDate: timestamp("enrollment_date", {
      withTimezone: true,
    }).defaultNow(),
    progressPercentage: integer("progress_percentage").default(0),
    completionStatus: varchar("completion_status", { length: 50 }).default(
      "in_progress"
    ),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
  },
  (table) => ({
    userIdIdx: index("idx_enrollments_user_id").on(table.userId),
    courseIdIdx: index("idx_enrollments_course_id").on(table.courseId),
  })
);

// =====================
// TRAINING SESSION TABLE
// =====================
export const trainingSessions = pgTable(
  "training_sessions",
  {
    sessionId: uuid("session_id").defaultRandom().primaryKey(),
    courseId: uuid("course_id")
      .references(() => courses.courseId, { onDelete: "cascade" })
      .notNull(),
    startTime: timestamp("start_time", { withTimezone: true }).notNull(),
    endTime: timestamp("end_time", { withTimezone: true }).notNull(),
    instructorId: uuid("instructor_id").references(() => authUsers.userId, {
      onDelete: "set null",
    }),
    maxParticipants: integer("max_participants"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
  },
  (table) => ({
    courseIdIdx: index("idx_training_sessions_course_id").on(table.courseId),
    instructorIdIdx: index("idx_training_sessions_instructor_id").on(
      table.instructorId
    ),
  })
);

// =====================
// LEARNING ANALYTICS TABLE
// =====================
export const learningAnalytics = pgTable("learning_analytics", {
  analyticsId: uuid("analytics_id").defaultRandom().primaryKey(),
  totalUsers: integer("total_users").default(0),
  totalCourses: integer("total_courses").default(0),
  totalEnrollments: integer("total_enrollments").default(0),
  totalCompletions: integer("total_completions").default(0),
  totalCertificates: integer("total_certificates").default(0),
  lastUpdated: timestamp("last_updated", { withTimezone: true }).defaultNow(),
});

// ...existing code...

// =====================
// CONTACT REQUESTS TABLE
// =====================
export const contactrequests = pgTable(
  "contactrequests",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    type: contactType("type").notNull(),
    name: varchar("name", { length: 255 }).notNull(),
    email: varchar("email", { length: 255 }).notNull(),
    phone: varchar("phone", { length: 20 }),
    subject: varchar("subject", { length: 255 }),
    message: text("message"),
    meetingType: varchar("meeting_type", { length: 255 }),
    scheduledDate: timestamp("scheduled_date"),
    durationMinutes: integer("duration_minutes"),
    status: contactStatus("status").default("unread").notNull(),
    priority: priorityLevel("priority"),
    submittedAt: timestamp("submitted_at", { withTimezone: true }).defaultNow(),
    respondedAt: timestamp("responded_at", { withTimezone: true }),
    userId: uuid("user_id").references(() => authUsers.userId, {
      onDelete: "set null",
    }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
  },
  (table) => ({
    emailIdx: index("idx_contactrequests_email").on(table.email),
    userIdx: index("idx_contactrequests_user_id").on(table.userId),
  })
);

// =====================
// NOTIFICATIONS TABLE
// =====================
export const notifications = pgTable(
  "notifications",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    recipientId: uuid("recipient_id")
      .references(() => authUsers.userId, { onDelete: "cascade" })
      .notNull(),
    type: varchar("type", { length: 50 }).notNull(),
    content: text("content").notNull(),
    status: notificationStatus("status").default("unread").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
  },
  (table) => ({
    recipientIdx: index("idx_notifications_recipient").on(table.recipientId),
  })
);
