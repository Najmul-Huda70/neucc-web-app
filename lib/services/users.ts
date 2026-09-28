import { prisma } from "../prisma";


export const userProfileSelect = {
  userId: true,
  name: true,
  email: true,
  role: true,
  image: true,
  status: true,
  user_posts: {
    select: {
      post: {
        select: {
          postTitle: true,
          committee: {
            select: {
              type: true,
              year: true,
              status: true,
            },
          },
        },
      },
    },
  },
};

export async function getUserProfile(userId: string) {
  if (!userId) return null;

  try {
    const userProfile = await prisma.user.findUnique({
      where: { userId },
      select: userProfileSelect,
    });
    return userProfile;
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return null;
  }
}