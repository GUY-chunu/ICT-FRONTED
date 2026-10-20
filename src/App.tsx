import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { DeskProvider } from "@/components/desk/desk-provider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "sonner";

// Import all main view pages
import { HomeView } from "@/views/HomeView";
import { WeeklyView } from "@/views/WeeklyView";
import { DailyView } from "@/views/DailyView";
import { PlaybookView } from "@/views/PlaybookView";
import { JournalView } from "@/views/JournalView";
import { ReplayView } from "@/views/ReplayView";
import { AnalyticsView } from "@/views/AnalyticsView";
import { ProtocolView } from "@/views/ProtocolView";

export default function App() {
  return (
    <BrowserRouter>
      <TooltipProvider delayDuration={200}>
        <DeskProvider>
          <Routes>
            <Route path="/" element={<HomeView />} />
            <Route path="/weekly" element={<WeeklyView />} />
            <Route path="/daily" element={<DailyView />} />
            <Route path="/playbook" element={<PlaybookView />} />
            <Route path="/journal" element={<JournalView />} />
            <Route path="/replay" element={<ReplayView />} />
            <Route path="/analytics" element={<AnalyticsView />} />
            <Route path="/protocol" element={<ProtocolView />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </DeskProvider>
      </TooltipProvider>
      <Toaster theme="dark" position="bottom-right" richColors />
    </BrowserRouter>
  );
}
