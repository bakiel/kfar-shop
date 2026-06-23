declare module '@h1dd3nsn1p3r/pdf-invoice' {
  export const PDFInvoice: any;
  const value: any;
  export default value;
}

declare module 'chart.js' {
  export const Chart: any;
  export const CategoryScale: any;
  export const LinearScale: any;
  export const PointElement: any;
  export const LineElement: any;
  export const BarElement: any;
  export const ArcElement: any;
  export const Title: any;
  export const Tooltip: any;
  export const Legend: any;
}

declare module 'react-chartjs-2' {
  export const Line: any;
  export const Bar: any;
  export const Doughnut: any;
}

declare module 'ai/react' {
  export function useChat(...args: any[]): any;
}

declare module '@/lib/ai/knowledge-base' {
  export const kfarKnowledgeBase: any;
  export const marketplaceKnowledgeBase: any;
  export default marketplaceKnowledgeBase;
}

declare module '@/lib/ai/master-orchestrator-agent' {
  export const masterOrchestrator: any;
  export const masterOrchestratorAgent: any;
  export default masterOrchestratorAgent;
}

declare module '@/lib/ai/vercel-ai-integration' {
  export function useVercelAIVoice(...args: any[]): any;
  export const vercelAIIntegration: any;
  export default vercelAIIntegration;
}

declare module '@/lib/data/vendors/teva-deli-catalog' {
  export const tevaDeliCompleteProducts: any[];
  export default tevaDeliCompleteProducts;
}

declare module '../teva-deli-catalog' {
  export const tevaDeliCompleteProducts: any[];
  export default tevaDeliCompleteProducts;
}

declare module '@/types/vendor' {
  export type VendorData = any;
  export type VendorProfile = any;
  export type VendorDocument = any;
  export type VendorWelcomePackage = any;
}

declare module '@prisma/client' {
  export const PrismaClient: any;
}
