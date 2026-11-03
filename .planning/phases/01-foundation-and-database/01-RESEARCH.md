# Phase 1 Research: Foundation & Database Layer

## 1. Objectives & Deliverables
Set up a robust, scalable, modern Next.js 15+ App Router application with TypeScript, Tailwind CSS, Lucide icons, and Prisma ORM backed by SQLite. Ensure the schema supports the full time-banking credit lifecycle, dual-direction skill listings (`TEACH` and `LEARN`), atomic credit transfers, and peer reviews.

## 2. Technical Stack & Dependencies
- **Core Framework:** Next.js (App Router), React 19, TypeScript
- **Styling:** Tailwind CSS with `@tailwindcss/postcss` or Tailwind v3/v4 setup, Lucide React icons
- **Database & ORM:** Prisma ORM (`@prisma/client`, `prisma`) with SQLite (`file:./dev.db`)
- **Utilities & Helpers:** `clsx`, `tailwind-merge`, `bcryptjs` (for hashed passwords in seed/auth), `tsx` (for executing TypeScript seed scripts)

## 3. Schema Architecture
```prisma
datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

model User {
  id              String             @id @default(cuid())
  name            String
  email           String             @unique
  passwordHash    String
  avatarUrl       String?
  bio             String?
  location        String?
  creditsBalance  Float              @default(3.0)
  createdAt       DateTime           @default(now())
  updatedAt       DateTime           @updatedAt

  listings        SkillListing[]
  sentRequests    ExchangeRequest[]  @relation("Requester")
  receivedRequests ExchangeRequest[] @relation("Provider")
  sentCredits     CreditTransaction[] @relation("Sender")
  receivedCredits CreditTransaction[] @relation("Receiver")
  writtenReviews  Review[]           @relation("ReviewAuthor")
  receivedReviews Review[]           @relation("ReviewReceiver")
}

model SkillListing {
  id              String            @id @default(cuid())
  userId          String
  user            User              @relation(fields: [userId], references: [id], onDelete: Cascade)
  type            String            // "TEACH" | "LEARN"
  title           String
  description     String
  category        String            // "Technology", "Music", "Languages", "Arts & Crafts", "Cooking", "Fitness", "Gardening"
  experienceLevel String            // "BEGINNER", "INTERMEDIATE", "ADVANCED", "ALL_LEVELS"
  format          String            // "ONLINE", "IN_PERSON", "HYBRID"
  location        String?           // e.g. "Brooklyn, NY" or "Remote / Zoom"
  durationMinutes Int               @default(60)
  status          String            @default("ACTIVE") // "ACTIVE", "PAUSED", "ARCHIVED"
  createdAt       DateTime          @default(now())
  updatedAt       DateTime          @updatedAt

  requests        ExchangeRequest[]
}

model ExchangeRequest {
  id                    String       @id @default(cuid())
  listingId             String
  listing               SkillListing @relation(fields: [listingId], references: [id], onDelete: Cascade)
  requesterId           String
  requester             User         @relation("Requester", fields: [requesterId], references: [id], onDelete: Cascade)
  providerId            String
  provider              User         @relation("Provider", fields: [providerId], references: [id], onDelete: Cascade)
  proposedDurationHours Float        @default(1.0)
  creditCost            Float        @default(1.0)
  status                String       @default("PENDING") // "PENDING", "ACCEPTED", "DECLINED", "CANCELLED", "COMPLETED"
  notes                 String?
  scheduledDate         DateTime?
  createdAt             DateTime     @default(now())
  updatedAt             DateTime     @updatedAt

  transaction           CreditTransaction?
  review                Review?
}

model CreditTransaction {
  id          String           @id @default(cuid())
  senderId    String?
  sender      User?            @relation("Sender", fields: [senderId], references: [id], onDelete: SetNull)
  receiverId  String
  receiver    User             @relation("Receiver", fields: [receiverId], references: [id], onDelete: Cascade)
  amount      Float
  type        String           // "WELCOME_BONUS", "EXCHANGE_PAYMENT", "ADMIN_ADJUSTMENT"
  exchangeId  String?          @unique
  exchange    ExchangeRequest? @relation(fields: [exchangeId], references: [id], onDelete: SetNull)
  createdAt   DateTime         @default(now())
}

model Review {
  id          String          @id @default(cuid())
  exchangeId  String          @unique
  exchange    ExchangeRequest @relation(fields: [exchangeId], references: [id], onDelete: Cascade)
  authorId    String
  author      User            @relation("ReviewAuthor", fields: [authorId], references: [id], onDelete: Cascade)
  receiverId  String
  receiver    User            @relation("ReviewReceiver", fields: [receiverId], references: [id], onDelete: Cascade)
  rating      Int             // 1 to 5
  comment     String?
  createdAt   DateTime        @default(now())
}
```

## 4. Seed Data Strategy
- Create 5 community members with diverse skill sets:
  - Elena Rostova (Music & Arts teacher, offers Acoustic Guitar & Painting, wants Web Dev)
  - Marcus Chen (Full-stack developer, offers Python & React, wants Conversational Spanish)
  - Sarah Jenkins (Culinary enthusiast, offers Sourdough & Artisan Pastry, wants Urban Gardening)
  - David Miller (Mechanic & DIY pro, offers Bicycle Repair & Home Carpentry, wants Yoga)
  - Maya Patel (Polyglot & Yoga instructor, offers Spanish & Vinyasa Yoga, wants French)
- Seed 10 realistic skill listings across categories.
- Seed welcome credit transactions (3.0 credits each) and 1 completed exchange demo.

## 5. Potential Gotchas & Verification Steps
- Windows path separators in Prisma SQLite paths (`file:./dev.db`).
- Ensuring Next.js 15 uses App Router conventions with proper TypeScript definitions.
- Running `prisma db push` to initialize SQLite file smoothly.
