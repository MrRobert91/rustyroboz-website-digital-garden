import { afterEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { ContactForm } from "@/components/contact-form";

afterEach(() => vi.restoreAllMocks());

function fillValidForm() {
  fireEvent.change(screen.getByLabelText(/name \(required\)/i), { target: { value: "David Example" } });
  fireEvent.change(screen.getByLabelText(/email \(required\)/i), { target: { value: "david@example.com" } });
  fireEvent.change(screen.getByLabelText(/project or idea/i), { target: { value: "An accessible project" } });
  fireEvent.change(screen.getByLabelText(/type of work/i), { target: { value: "consulting" } });
  fireEvent.change(screen.getByLabelText(/timeline \(required\)/i), { target: { value: "Next month" } });
  fireEvent.change(screen.getByLabelText(/message \(required\)/i), { target: { value: "Please contact me about this project." } });
}

describe("ContactForm", () => {
  it("provides visible labels and associates client validation errors", async () => {
    render(<ContactForm />);
    fireEvent.click(screen.getByRole("button", { name: /send message/i }));

    const summary = await screen.findByRole("alert");
    expect(summary).toHaveTextContent(/review the form/i);
    expect(screen.getByLabelText(/name \(required\)/i)).toHaveAttribute("aria-invalid", "true");
    expect(screen.getByLabelText(/name \(required\)/i)).toHaveAttribute("aria-describedby", "name-error");
    await waitFor(() => expect(summary).toHaveFocus());
  });

  it("announces successful delivery and prevents a duplicate submission while pending", async () => {
    let finish: ((value: unknown) => void) | undefined;
    vi.stubGlobal("fetch", vi.fn(() => new Promise((resolve) => { finish = resolve; })));
    render(<ContactForm />);
    fillValidForm();
    fireEvent.click(screen.getByRole("button", { name: /send message/i }));

    expect(screen.getByRole("button", { name: /sending/i })).toBeDisabled();
    finish?.({ ok: true, json: async () => ({ message: "Thanks. Your message was sent successfully." }) });
    expect(await screen.findByRole("status")).toHaveTextContent(/sent successfully/i);
  });

  it("preserves entries after a provider error", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: false, json: async () => ({ message: "Delivery is unavailable." }) }),
    );
    render(<ContactForm />);
    fillValidForm();
    fireEvent.click(screen.getByRole("button", { name: /send message/i }));

    expect(await screen.findByRole("alert")).toHaveTextContent(/delivery is unavailable/i);
    expect(screen.getByLabelText(/project or idea/i)).toHaveValue("An accessible project");
  });
});
