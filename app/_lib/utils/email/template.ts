interface EmailTemplateProps {
  heroUrl: string;
  name: string;
  heroName: string;
  personalityName: string;
  color: string;
}

export function getEmailTemplate({ heroUrl, name, heroName, personalityName, color }: EmailTemplateProps): string {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #2563eb;">Din Superhelt-Match</h1>
      <p>Hei! Du har nettopp generert en superhelt på <a href="${new URL(heroUrl).origin}" style="color: #2563eb; text-decoration: underline;">${new URL(heroUrl).origin.replace('https://', '')}</a>. Her er din unike superhelt-profil:</p>
      <div style="background-color: #f3f4f6; padding: 16px; border-radius: 8px; margin: 16px 0;">
        <p><strong>Navn:</strong> ${name}</p>
        <p><strong>Superheltnavn:</strong> ${heroName}</p>
        <p><strong>Personlighetstype:</strong> ${personalityName}</p>
        <p><strong>Farge:</strong> ${color}</p>
      </div>
      <p>Klikk på lenken under for å se din superhelt-match:</p>
      <a href="${heroUrl}" style="display: inline-block; background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; margin: 16px 0;">Se Din Helt</a>
      <p style="color: #666; font-size: 12px; margin-top: 24px;">
        Denne e-posten ble sendt fordi noen ba om å dele en superhelt-match. 
        Hvis du ikke ba om dette, kan du trygt ignorere denne e-posten.
      </p>
    </div>
  `;
}
