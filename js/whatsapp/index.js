export function initializeWhatsAppForm({ window, document }) {
  document.querySelectorAll('[data-whatsapp-form]').forEach((form) => {
    const questionField = form.querySelector('textarea');
    if (!questionField) return;
    const isAvailability = form.dataset.whatsappForm === 'availability';

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
      const text = questionField.value.trim();
      if (!text) {
        questionField.setCustomValidity(isAvailability
          ? 'Informe os dias e horários em que você pode ser atendida.'
          : 'Digite sua dúvida antes de enviar.');
        questionField.reportValidity();
        return;
      }
      const message = isAvailability
        ? `Olá! Gostaria de agendar um horário. Minha disponibilidade:\n${text}\nVocê tem algum horário disponível nesse período?`
        : `Olá! Tenho uma dúvida: ${text}`;
      const url = `https://wa.me/5534992797055?text=${encodeURIComponent(message)}`;
      window.open(url, '_blank', 'noopener,noreferrer');
    });

    form.hidden = false;
    resizeQuestionField();
  });
}
