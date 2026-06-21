export type Lang = 'fr' | 'en'

const translations: Record<string, Record<Lang, string>> = {
  // --- Login page ---
  'login.title': { fr: 'TeamChat AI', en: 'TeamChat AI' },
  'login.subtitle': { fr: 'Agent RH - Demo Restaurant Group', en: 'HR Agent - Demo Restaurant Group' },
  'login.agendrix_hint': { fr: 'Utilise l\'email de ton profil', en: 'Use your profile email' },

  // --- LoginForm ---
  'login.email_label': { fr: 'Adresse email', en: 'Email address' },
  'login.email_placeholder': { fr: 'ton@email.com', en: 'your@email.com' },
  'login.send_code': { fr: 'Recevoir mon code', en: 'Get my code' },
  'login.sending': { fr: 'Envoi en cours...', en: 'Sending...' },
  'login.email_not_registered': { fr: 'Cet email n\'est pas enregistre.', en: 'This email is not registered.' },
  'login.email_not_registered_help': { fr: 'Ton compte est configure avec ton email. Verifie ou ecris a admin@demo-restaurants.com pour de l\'aide.', en: 'Your account is set up with your email. Check or email admin@demo-restaurants.com for help.' },
  'login.rate_limit': { fr: 'Trop de tentatives. Attends quelques instants avant de reessayer.', en: 'Too many attempts. Wait a moment before trying again.' },
  'login.request_access': { fr: 'Demander l\'acces', en: 'Request access' },
  'login.no_access_yet': { fr: 'Besoin d\'aide ? Ecris a admin@demo-restaurants.com', en: 'Need help? Email admin@demo-restaurants.com' },

  // Code step
  'login.code_sent_to': { fr: 'Code envoye a', en: 'Code sent to' },
  'login.connection_code': { fr: 'Code de connexion', en: 'Login code' },
  'login.verifying': { fr: 'Verification...', en: 'Verifying...' },
  'login.sign_in': { fr: 'Se connecter', en: 'Sign in' },
  'login.change_email': { fr: 'Changer d\'email', en: 'Change email' },
  'login.resend_code': { fr: 'Renvoyer le code', en: 'Resend code' },
  'login.invalid_code': { fr: 'Code invalide ou expire. Reessaie.', en: 'Invalid or expired code. Try again.' },

  // Access request step
  'login.request_access_title': { fr: 'Demander l\'acces', en: 'Request access' },
  'login.request_access_subtitle': { fr: 'La direction recevra ta demande', en: 'Management will receive your request' },
  'login.email': { fr: 'Email', en: 'Email' },
  'login.your_name': { fr: 'Ton nom', en: 'Your name' },
  'login.name_placeholder': { fr: 'Prenom Nom', en: 'First Last' },
  'login.message_optional': { fr: 'Message (optionnel)', en: 'Message (optional)' },
  'login.message_placeholder': { fr: 'Restaurant, poste, etc.', en: 'Restaurant, position, etc.' },
  'login.sending_request': { fr: 'Envoi...', en: 'Sending...' },
  'login.send_request': { fr: 'Envoyer la demande', en: 'Send request' },
  'login.request_error': { fr: 'Erreur lors de l\'envoi. Reessaie.', en: 'Error sending request. Try again.' },
  'login.back_to_login': { fr: 'Retour a la connexion', en: 'Back to login' },
  'login.request_sent_title': { fr: 'Demande envoyee', en: 'Request sent' },
  'login.request_sent_message': { fr: 'La direction a recu ta demande d\'acces. Tu seras contacte(e) prochainement.', en: 'Management received your access request. You\'ll be contacted soon.' },

  // --- Chat ---
  'chat.logout': { fr: 'Deconnexion', en: 'Log out' },
  'chat.greeting': { fr: 'Bonjour {name} ! Je suis TeamChat AI, ton agent RH.', en: 'Hi {name}! I\'m TeamChat AI, your HR agent.' },
  'chat.prompt': { fr: 'Pose-moi tes questions ou partage tes preoccupations.', en: 'Ask me your questions or share your concerns.' },
  'chat.error_occurred': { fr: 'Desole, une erreur s\'est produite: ', en: 'Sorry, an error occurred: ' },
  'chat.unknown_error': { fr: 'Erreur inconnue', en: 'Unknown error' },
  'chat.input_placeholder': { fr: 'Ecris ton message...', en: 'Write your message...' },

  // Chat tool events
  'chat.bot_name': { fr: 'TeamChat AI', en: 'TeamChat AI' },
  'chat.tool_tips': { fr: 'Consultation des pourboires...', en: 'Loading tips data...' },
  'chat.tool_schedule': { fr: 'Consultation de l\'horaire...', en: 'Loading schedule...' },
  'chat.tool_email': { fr: 'Preparation de l\'email pour la direction...', en: 'Preparing email for management...' },
  'chat.tool_knowledge': { fr: 'Recherche dans les politiques...', en: 'Searching policies...' },
  'chat.email_ready': { fr: 'Email pret a envoyer', en: 'Email ready to send' },
  'chat.email_instructions': { fr: 'Copie et envoie a admin@demo-restaurants.com', en: 'Copy and send to admin@demo-restaurants.com' },
  'chat.tips_loaded': { fr: 'Donnees pourboires chargees', en: 'Tips data loaded' },
  'chat.tips_owed': { fr: 'Du', en: 'Owed' },
  'chat.tips_paid': { fr: 'Paye', en: 'Paid' },
  'chat.tips_balance': { fr: 'Solde', en: 'Balance' },
  'chat.articles_found': { fr: 'article(s) trouve(s)', en: 'article(s) found' },

  // --- Bottom nav ---
  'nav.chat': { fr: 'Chat', en: 'Chat' },
  'nav.tips': { fr: 'Pourboires', en: 'Tips' },
  'nav.admin': { fr: 'Admin', en: 'Admin' },

  // --- Tips dashboard ---
  'tips.title': { fr: 'Mes pourboires', en: 'My tips' },
  'tips.loading': { fr: 'Chargement des pourboires...', en: 'Loading tips...' },
  'tips.no_staff_link': { fr: 'Ton compte n\'est pas encore lie au systeme de pourboires. Demande a TeamChat AI via le chat.', en: 'Your account is not yet linked to the tips system. Ask TeamChat AI via chat.' },
  'tips.loading_error': { fr: 'Erreur de chargement', en: 'Loading error' },
  'tips.total_owed': { fr: 'Total du', en: 'Total owed' },
  'tips.total_paid': { fr: 'Total paye', en: 'Total paid' },
  'tips.balance': { fr: 'Solde', en: 'Balance' },
  'tips.weekly_detail': { fr: 'Detail par semaine', en: 'Weekly detail' },
  'tips.no_data': { fr: 'Aucune donnee', en: 'No data' },

  // --- Error states (server pages) ---
  'error.access_not_configured': { fr: 'Acces non configure', en: 'Access not configured' },
  'error.no_employee_profile': { fr: 'Ton compte n\'est pas encore lie a un profil employe.', en: 'Your account is not yet linked to an employee profile.' },
  'error.contact_manager': { fr: 'Contacte ton responsable pour activer ton acces.', en: 'Contact your manager to activate your access.' },
}

export function t(key: string, lang: Lang = 'fr'): string {
  return translations[key]?.[lang] ?? translations[key]?.fr ?? key
}
