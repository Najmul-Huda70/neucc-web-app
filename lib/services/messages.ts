import { prisma } from "@/lib/prisma";



export async function getAllMessages() {

try {

return await prisma.message.findMany({

orderBy: {

displayOrder: "asc",

},

});

} catch (error) {

console.error("Error fetching messages:", error);

return [];

}

}