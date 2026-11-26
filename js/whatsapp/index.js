export function initializeWhatsAppForm({ window, document }) {
  document.querySelectorAll('[data-whatsapp-form]').forEach((form) => {
    const questionField = form.querySelector('textarea');
    if (!questionField) return;

    const resizeQuestionField = () => {
      questionField.style.height = 'auto';
      questionField.style.height = `${questionField.scrollHeight}px`;
    };
    questionField.addEventListener('input', () => {
      questionField.setCustomValidity('');
      resizeQuestionField();
    });

    form.addEventListener('submit', (event) => {
      event.preventDefault();
      const question = questionField.value.trim();
      if (!question) {
        questionField.setCustomValidity('Digite sua dúvida antes de enviar.');
        questionField.reportValidity();
        return;
      }
      const message = `Ol\u00e1! Vim pelo site e enviei uma d\u00favida pela se\u00e7\u00e3o de d\u00favidas frequentes: ${question}`;
      const url = `https://wa.me/5534992797055?text=${encodeURIComponent(message)}`;
      window.open(url, '_blank', 'noopener,noreferrer');
    });

    form.hidden = false;
    resizeQuestionField();
  });
}
