# AI-UI: Interactive Chatbot Interface

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Open Source Love](https://badges.frapsoft.com/os/v1/open-source.svg?v=103)](https://craftedcodex.vercel.app/)


A GitHub-hosted project showcasing an interactive chatbot UI built with modern web technologies.  It provides a seamless and responsive interface for users to engage with AI-driven conversations, making it ideal for testing chatbot models, integrating APIs, or enhancing user interactions. The code is designed for easy customization, featuring a clean layout, message handling, and optional AI integrations.  Created with passion by CraftedCodeX.

[**Live Demo**](https://craftedcodex.vercel.app/AI-UI) 

## Table of Contents

- [Features](#features)
- [Technology Stack](#technology-stack)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
- [Configuration](#configuration)
- [Usage](#usage)
- [Customization](#customization)
- [API Integration](#api-integration)
- [Contributing](#contributing)
- [License](#license)
- [Credits](#credits)

## Features

*   **Interactive Chat Interface**: Provides a user-friendly interface for engaging in conversations with an AI.
*   **Responsive Design**: Fully responsive layout that adapts to various screen sizes (desktops, tablets, and mobile devices).
*   **Glassmorphism Effect**: Implements a visually appealing glass effect on various UI elements.
*   **Chat History**: Maintains a history of previous conversations for easy reference.
*   **New Chat**: Allows users to start a new chat session with a single click.
*   **Search Functionality**: Enables users to search through their chat history.
*   **Edit & Delete Chats**: Ability to edit the title and delete previous chat conversations.
*   **User & Bot Messages**: Clearly distinguishes between user and bot messages.
*   **Typing Indicator**: Shows a typing animation when the bot is generating a response.
*   **Code Highlighting**: Utilizes Prism.js for syntax highlighting in code snippets.
*   **API Key Integration**: Allows users to input their API keys for services like Google AI and OpenAI.
*   **AI Provider Selection**:  Easy switching between Google's Gemini and OpenAI.
*   **Message Length Validation**:  Prevents users from sending excessively long messages.
*   **Error Handling**:  Displays user-friendly error messages.
*   **Loading Indicators**: Visual loading states for API calls.
*   **Accessibility**: Includes ARIA labels and roles for better accessibility.
*   **Scrollbar Customization**: Customizes the appearance of the scrollbar.
*   **Mobile-Friendly**: Optimizations and specific UI adjustments for smaller screens including a mobile menu.
*   **Syntax Highlighting:** Automatically detects and highlights code snippets in bot responses.
*   **Styling for Code, Bold, Italics, and HR:** Bot responses are formatted for clarity and readability.
*   **Automatic Textarea Resizing:** The input textarea adjusts its size to fit the text.

## Technology Stack

*   **HTML**: Structure of the web page.
*   **CSS**: Styling and layout, including glassmorphism effects.
*   **JavaScript**:  Interactive functionality, API calls, and message handling.
*   **Font Awesome**: Icons for UI elements.
*   **Poppins Font**:  Clean and readable font for the user interface.
*   **Prism.js**: Syntax highlighting for code snippets.
*   **Google AI API (Gemini)**: Integration with Google's AI models.
*   **OpenAI API**: Integration with OpenAI's models (GPT).

## Getting Started

### Prerequisites

*   A modern web browser (Chrome, Firefox, Safari, etc.)
*   Basic knowledge of HTML, CSS, and JavaScript
*   (Optional) API keys for Google AI and OpenAI

### Installation

1.  **Clone the repository:**

    ```bash
    git clone https://github.com/dhrrishit/ai-ui-by-craftedcodex
    ```

2.  **Navigate to the project directory:**

    ```bash
    cd ai-ui-by-craftedcodex
    ```

3.  **Open `index.html` in your browser.**

## Configuration

1.  **API Keys:**
    *   Obtain API keys from Google AI (Gemini) and/or OpenAI.
    *   Enter your API key in the "API Key" input field in the UI.
2.  **AI Provider Selection:**
    *   Select either "Google's Gemini" or "OpenAI" using the radio buttons to choose which AI to use.

## Usage

1.  **Start a New Chat:**
    *   Click the "New Chat" button to start a new conversation.
2.  **Send Messages:**
    *   Type your message in the input field and press Enter or click the send button.
3.  **View Chat History:**
    *   Select a previous chat from the chat history on the left sidebar to view the conversation.
4.  **Edit Chat Title:**
    *   Hover over a chat in the history, click the edit icon, enter the new title, and press Enter.
5.  **Delete Chat:**
    *   Hover over a chat in the history and click the delete icon.
6.  **Search Chat:**
     * Use the Search bar to find chats based on the title.


## API Integration

*   **Google AI (Gemini):** The `callGoogleAI` function handles the API call to Google's Gemini.
*   **OpenAI:** The `callOpenAI` function handles the API call to OpenAI.

You can modify these functions to integrate with other AI models or services by changing the API endpoints, request parameters, and response handling logic.  Make sure to handle API keys securely and follow the respective API's guidelines and rate limits.

## Contributing

Contributions are welcome!  Here's how you can contribute:

1.  Fork the repository.
2.  Create a new branch for your feature or bug fix.
3.  Make your changes.
4.  Test your changes thoroughly.
5.  Submit a pull request.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Credits

*   **CraftedCodeX**:  Project design and development.
*   **Font Awesome**: Icons used in the interface.
*   **Prism.js**: Syntax highlighting.
*   **Google AI**: For providing the Gemini AI model.
*   **OpenAI**: For providing the OpenAI models.


## Author
**Dhrrishit Deka**
- **Email**: dhrrishit@gmail.com
- **GitHub**: https://github.com/dhrrishit
- **LinkedIn**: https://www.linkedin.com/in/dhrrishitdeka/
- **X (Twitter)**: https://x.com/dhrrishitdeka

Feel free to reach out with any questions or feedback! We hope this project provides a solid foundation for your chatbot UI needs.
