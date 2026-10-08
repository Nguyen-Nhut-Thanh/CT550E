"use client";

import { Search } from "lucide-react";
import CustomDropdown from "@/components/common/CustomDropdown";
import SearchBarCalendar from "./SearchBarCalendar";
import { BUDGET_OPTIONS } from "@/lib/client/utils/searchBar.utils";
import { useSearchBar } from "@/lib/client/hooks/useSearchBar";

export default function SearchBar() {
  const { state, actions } = useSearchBar();

  return (
    <section className="relative z-30 -mt-5 px-4 sm:px-6 lg:-mt-7 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <form
          onSubmit={actions.submit}
          className="rounded-[28px] border border-slate-200 bg-white p-3 shadow-[0_18px_60px_rgba(15,23,42,0.12)] md:p-4"
        >
          <div className="grid gap-4 md:grid-cols-[minmax(0,1.7fr)_minmax(220px,1fr)_minmax(180px,0.9fr)_76px] md:items-center md:gap-0">
            <label className="min-w-0 px-3 md:pr-7" htmlFor="tour-search">
              <span className="text-[15px] font-semibold text-slate-800">
                Bạn muốn đi đâu? <span className="text-red-500">*</span>
              </span>
              <input
                id="tour-search"
                value={state.keyword}
                onChange={(event) => actions.setKeyword(event.target.value)}
                placeholder="Tên tour, điểm đến, mã tour..."
                className="mt-3 w-full border-0 p-0 text-[16px] text-slate-900 outline-none placeholder:text-slate-400 focus:ring-0 md:text-[17px]"
              />
            </label>

            <div className="border-t border-slate-300 px-3 pt-4 md:border-l md:border-t-0 md:px-6 md:pt-0">
              <SearchBarCalendar
                selectedDate={state.selectedDate}
                calendarMonth={state.calendarMonth}
                calendarDays={state.calendarDays}
                today={state.today}
                isOpen={state.isCalendarOpen}
                onToggle={() => {
                  actions.setCalendarMonth(
                    new Date(
                      state.selectedDate.getFullYear(),
                      state.selectedDate.getMonth(),
                      1,
                    ),
                  );
                  actions.setIsCalendarOpen(!state.isCalendarOpen);
                }}
                onSelect={actions.selectDate}
                onMonthChange={actions.setCalendarMonth}
              />
            </div>

            <div className="border-t border-slate-300 px-3 pt-4 md:border-l md:border-t-0 md:px-6 md:pt-0">
              <CustomDropdown
                label="Ngân sách"
                variant="minimal"
                options={BUDGET_OPTIONS.filter(
                  (_, index) => index !== 0,
                ).map((option) => ({
                  label: option.label,
                  value: option.label,
                }))}
                selectedValue={state.budget?.label ?? ""}
                onSelect={actions.selectBudget}
                placeholder="Chọn ngân sách"
              />
            </div>

            <button
              type="submit"
              disabled={!state.isValid}
              className={`flex h-14 w-full items-center justify-center rounded-2xl transition md:h-[76px] md:w-[76px] ${
                state.isValid
                  ? "bg-sky-500 text-white shadow-lg shadow-sky-100 hover:bg-sky-600"
                  : "cursor-not-allowed bg-slate-100 text-slate-400"
              }`}
              aria-label="Tìm kiếm tour"
            >
              <Search className="h-6 w-6" />
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}
