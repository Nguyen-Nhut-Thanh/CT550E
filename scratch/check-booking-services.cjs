require('dotenv').config({quiet:true});
const {PrismaClient}=require('@prisma/client');const db=new PrismaClient();
(async()=>{
  await db.bookings.findFirst({select:{additional_services:true,services_total:true}});
  const response=await fetch('http://localhost:4000/public/booking-services');
  if(!response.ok) throw new Error('Service API status '+response.status);
  const items=await response.json();
  if(items.length!==3 || items.some(item=>item.id.includes('guide'))) throw new Error('Unexpected service catalogue');
  console.log('Verified live database fields and three-service API.');
})().catch(error=>{console.error(error.code || error.message);process.exitCode=1}).finally(()=>db.$disconnect());
