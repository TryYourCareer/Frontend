import BACKEND_BASE_URL from "../API/BaseURL";

async function parseApiError(response) {
  try {
    const data = await response.json();
    if (Array.isArray(data?.detail)) {
      return data.detail
        .map((item) => item?.msg || item?.message)
        .filter(Boolean)
        .join(" ");
    }
    return data?.detail || data?.message || "Request failed.";
  } catch {
    return "Request failed.";
  }
}

async function parseJsonResponse(response) {
  try {
    return await response.json();
  } catch {
    return null;
  }
}

export async function startTestSession(userId) {
  const response = await fetch(`${BACKEND_BASE_URL}/discovery-test/start`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ user_id: userId }),
  });

  if (!response.ok) {
    throw new Error(await parseApiError(response));
  }

  return parseJsonResponse(response);
}

export async function getTestQuestions(testSessionId) {
  const response = await fetch(`${BACKEND_BASE_URL}/discovery-test/${testSessionId}/questions`);
  if (!response.ok) {
    throw new Error(await parseApiError(response));
  }
  return parseJsonResponse(response);
}

export async function submitQuestionAnswer({
  testSessionId,
  questionId,
  selectedOptionId,
  responseText = null,
  responseTimeMs = null,
}) {
  const response = await fetch(
    `${BACKEND_BASE_URL}/discovery-test/${testSessionId}/questions/${questionId}/answer`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        selected_option_id: selectedOptionId,
        response_text: responseText,
        response_time_ms: responseTimeMs,
      }),
    }
  );

  if (!response.ok) {
    throw new Error(await parseApiError(response));
  }

  return parseJsonResponse(response);
}

export async function getTestProgress(testSessionId) {
  const response = await fetch(`${BACKEND_BASE_URL}/discovery-test/${testSessionId}/progress`);
  if (!response.ok) {
    throw new Error(await parseApiError(response));
  }
  return parseJsonResponse(response);
}

export async function submitTestSession(testSessionId) {
  const response = await fetch(`${BACKEND_BASE_URL}/discovery-test/${testSessionId}/submit`, {
    method: "POST",
  });

  if (!response.ok) {
    throw new Error(await parseApiError(response));
  }

  return parseJsonResponse(response);
}
