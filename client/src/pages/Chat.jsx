import {
  useEffect,
  useRef,
  useState,
} from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

const welcomeMessage = {
  id: "welcome",
  role: "assistant",
  content:
    "Namaste! Main TrekMate AI hoon. Trek, destination, budget, packing ya travel planning ke baare mein kuch bhi poochho.",
};

const suggestions = [
  "Beginner ke liye best Himalayan trek?",
  "Trek packing checklist bana do",
  "₹15,000 mein Manali trip plan karo",
];

function Chat() {
  const [messages, setMessages] = useState([
    welcomeMessage,
  ]);
  const [input, setInput] = useState("");
  const [loadingHistory, setLoadingHistory] =
    useState(true);
  const [sending, setSending] = useState(false);
  const [clearing, setClearing] = useState(false);

  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const bottomRef = useRef(null);

  useEffect(() => {
    const fetchChatHistory = async () => {
      try {
        setLoadingHistory(true);

        const { data } = await api.get(
          "/chat/history"
        );

        if (data.messages.length > 0) {
          const savedMessages =
            data.messages.map((message) => ({
              id:
                message._id ||
                `${message.role}-${message.createdAt}`,
              role: message.role,
              content: message.content,
            }));

          setMessages(savedMessages);
        } else {
          setMessages([welcomeMessage]);
        }
      } catch (error) {
        setMessages([
          welcomeMessage,
          {
            id: "history-error",
            role: "assistant",
            content:
              error.response?.data?.message ||
              "Saved chat history load nahi ho paayi.",
            isError: true,
          },
        ]);
      } finally {
        setLoadingHistory(false);
      }
    };

    fetchChatHistory();
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages, sending]);

  const getDashboardPath = () => {
    if (user?.role === "admin") return "/admin";
    if (user?.role === "staff") return "/staff";

    return "/dashboard";
  };

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const handleClearHistory = async () => {
    const confirmed = window.confirm(
      "Are you sure you want to clear your complete chat history?"
    );

    if (!confirmed) return;

    try {
      setClearing(true);

      await api.delete("/chat/history");

      setMessages([welcomeMessage]);
    } catch (error) {
      setMessages((current) => [
        ...current,
        {
          id: `clear-error-${Date.now()}`,
          role: "assistant",
          content:
            error.response?.data?.message ||
            "Chat history clear nahi ho paayi.",
          isError: true,
        },
      ]);
    } finally {
      setClearing(false);
    }
  };

  const sendMessage = async (messageText) => {
    const trimmedMessage = messageText.trim();

    if (
      !trimmedMessage ||
      sending ||
      loadingHistory
    ) {
      return;
    }

    const userMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content: trimmedMessage,
    };

    setMessages((current) => [
      ...current,
      userMessage,
    ]);

    setInput("");
    setSending(true);

    try {
      const { data } = await api.post("/chat", {
        message: trimmedMessage,
      });

      setMessages((current) => [
        ...current,
        {
          id: `assistant-${Date.now()}`,
          role: "assistant",
          content: data.reply,
        },
      ]);
    } catch (error) {
      setMessages((current) => [
        ...current,
        {
          id: `error-${Date.now()}`,
          role: "assistant",
          content:
            error.response?.data?.message ||
            "Sorry, abhi response nahi mil pa raha. Dobara try karo.",
          isError: true,
        },
      ]);
    } finally {
      setSending(false);
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    sendMessage(input);
  };

  const showSuggestions =
    !loadingHistory &&
    messages.length === 1 &&
    messages[0].id === "welcome";

  return (
    <main className="chat-page">
      <header className="chat-header">
        <div>
          <p className="eyebrow">TREKMATE AI</p>
          <h1>Hello, {user?.name}</h1>
        </div>

        <div className="table-actions">
          <button
            className="refresh-button"
            onClick={() =>
              navigate(getDashboardPath())
            }
          >
            Dashboard
          </button>

          <button
            className="reject-button"
            onClick={handleClearHistory}
            disabled={clearing}
          >
            {clearing
              ? "Clearing..."
              : "Clear Chat"}
          </button>

          <button
            className="logout-button"
            onClick={handleLogout}
          >
            Logout
          </button>
        </div>
      </header>

      <section className="chat-shell">
        <div className="messages">
          {loadingHistory ? (
            <p className="empty-state">
              Loading chat history...
            </p>
          ) : (
            <>
              {messages.map((message) => (
                <article
                  key={message.id}
                  className={`message ${
                    message.role
                  } ${
                    message.isError
                      ? "error"
                      : ""
                  }`}
                >
                  <span className="message-author">
                    {message.role === "user"
                      ? "You"
                      : "TrekMate"}
                  </span>

                  <p>{message.content}</p>
                </article>
              ))}

              {showSuggestions && (
                <div className="suggestions">
                  {suggestions.map(
                    (suggestion) => (
                      <button
                        key={suggestion}
                        onClick={() =>
                          sendMessage(suggestion)
                        }
                      >
                        {suggestion}
                      </button>
                    )
                  )}
                </div>
              )}

              {sending && (
                <article className="message assistant">
                  <span className="message-author">
                    TrekMate
                  </span>
                  <p className="typing">
                    Thinking...
                  </p>
                </article>
              )}
            </>
          )}

          <div ref={bottomRef} />
        </div>

        <form
          className="chat-form"
          onSubmit={handleSubmit}
        >
          <textarea
            value={input}
            onChange={(event) =>
              setInput(event.target.value)
            }
            placeholder="Ask anything about travel or trekking..."
            maxLength="4000"
            rows="1"
            disabled={sending || loadingHistory}
            onKeyDown={(event) => {
              if (
                event.key === "Enter" &&
                !event.shiftKey
              ) {
                event.preventDefault();
                handleSubmit(event);
              }
            }}
          />

          <button
            type="submit"
            disabled={
              sending ||
              loadingHistory ||
              !input.trim()
            }
          >
            {sending ? "Sending..." : "Send"}
          </button>
        </form>
      </section>

      <p className="chat-note">
        Verify current weather, permits and route
        conditions from official sources.
      </p>
    </main>
  );
}

export default Chat;