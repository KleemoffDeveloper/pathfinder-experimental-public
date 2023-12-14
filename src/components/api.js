const API_URL = import.meta.env.VITE_API_URL;

/**
 * A story node is a portion of the overall story generated from ChatGPT.
 */
export default async function storyNode(m_messages, setMessages) {
  let m_error;

  // Generates a valid JSON object in this format:
  /**
   * {
        plot: "",
        choices: [ "", "", "" ],
        consumables: [ "", "", "" ],
        imagePrompt: ""
     }
   */
  const textRequest = await fetch(API_URL + "/response", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(m_messages),
  })
    .then((response) => response.json())
    .then((data) => {
      return data;
    })
    .catch((error) => {
      m_error = true;
    });

  if (m_error) {
    return {
      error:
        "Something went wrong when trying to generate text for the story. Please try again.",
    };
  }

  let m_currentMessage = JSON.parse(textRequest.content);

  // Generates a valid JSON object in this format:
  /**
   * {
        content: "https://example.com/image.png"
     }
   */
  const imageRequest = await fetch(API_URL + "/image", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      content: m_currentMessage.imagePrompt
        ? m_currentMessage.imagePrompt
        : m_currentMessage.plot,
    }),
  })
    .then((response) => response.json())
    .then((data) => {
      return data;
    })
    .catch((error) => {
      m_error = true;
    });

  if (m_error) {
    return {
      error:
        "Something went wrong when trying to generate the image for the story. Please try again.",
    };
  }

  // Updating the context for ChatGPT
  setMessages([...m_messages, textRequest]);

  const node = { ...m_currentMessage, image_url: imageRequest.content };

  return node;
}
