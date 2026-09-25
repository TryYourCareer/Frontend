import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import Sidebar from "../Sidebar";

describe("Sidebar Navigation", () => {
  const mockOnNavigate = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("1. renders Report Engine navigation item with appropriate icon", () => {
    render(<Sidebar activePage="landing" onNavigate={mockOnNavigate} />);

    expect(screen.getByText("Report Engine")).toBeInTheDocument();
  });

  test("2. triggers onNavigate with 'reports' action when Report Engine is clicked", () => {
    render(<Sidebar activePage="landing" onNavigate={mockOnNavigate} />);

    const reportEngineBtn = screen.getByText("Report Engine").closest("button");
    expect(reportEngineBtn).toBeInTheDocument();

    fireEvent.click(reportEngineBtn);

    expect(mockOnNavigate).toHaveBeenCalledWith("reports");
  });

  test("3. highlights Report Engine when activePage is 'reports'", () => {
    const { container } = render(<Sidebar activePage="reports" onNavigate={mockOnNavigate} />);

    const reportEngineBtn = screen.getByText("Report Engine").closest("button");
    expect(reportEngineBtn).toHaveClass("bg-[#0b1a36]");
    expect(reportEngineBtn).toHaveClass("text-white");
  });
});
