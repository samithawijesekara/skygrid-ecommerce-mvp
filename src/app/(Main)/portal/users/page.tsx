// import { Metadata } from "next";
// import fs from "fs";
// import path from "path";
// import {
//   Breadcrumb,
//   BreadcrumbItem,
//   BreadcrumbLink,
//   BreadcrumbList,
//   BreadcrumbPage,
//   BreadcrumbSeparator,
// } from "@/components/ui/breadcrumb";
// import { Separator } from "@/components/ui/separator";
// import {
//   SidebarInset,
//   SidebarProvider,
//   SidebarTrigger,
// } from "@/components/ui/sidebar";

// export const metadata: Metadata = {
//   title: "Expenses",
//   description: "A Expense tracker build using Tanstack Table.",
// };

// async function getData() {
//   const filePath = path.join(
//     process.cwd(),
//     "src/app/components/data-table-components",
//     "data.json"
//   );
//   const data = fs.readFileSync(filePath, "utf8");
//   return JSON.parse(data);
// }

// export default async function Page() {
//   const data = await getData();
//   console.log("data", data);

//   return (
//     <>
//       <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
//         <div className="flex items-center gap-2 px-4">
//           <SidebarTrigger className="-ml-1" />
//           <Separator orientation="vertical" className="mr-2 h-4" />
//           <Breadcrumb>
//             <BreadcrumbList>
//               <BreadcrumbItem className="hidden md:block">
//                 <BreadcrumbLink href="#">
//                   Building Your Application
//                 </BreadcrumbLink>
//               </BreadcrumbItem>
//               <BreadcrumbSeparator className="hidden md:block" />
//               <BreadcrumbItem>
//                 <BreadcrumbPage>Data Fetching</BreadcrumbPage>
//               </BreadcrumbItem>
//             </BreadcrumbList>
//           </Breadcrumb>
//         </div>
//       </header>
//       <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
//         <h1 className="text-4xl">All Users</h1>
//         <div className="h-full flex-1 flex-col space-y-2 p-8 md:flex">
//           <div className="flex items-center justify-between">
//             <p className="text-muted-foreground">
//               Here&apos;s a list of your expenses for this month!
//             </p>
//           </div>
//           <DataTable data={data} columns={columns} />
//         </div>
//         <div className="min-h-[100vh] flex-1 rounded-xl bg-muted/50 md:min-h-min" />
//       </div>
//     </>
//   );
// }
