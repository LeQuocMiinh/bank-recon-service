import { ZodIssue } from 'zod';

export function handleErrors(validateResult: ZodIssue[]): {
  ok: boolean;
  error: { code: number; message: string; details: string[] };
} {
  const minimalErrors = validateResult.map(({ path, message }) => {
    let propertyName = path.length > 0 ? path[0] : '';
    if (propertyName !== '') {
      propertyName = path.length == 1 ? path[0] : path[path.length - 1];
      if (typeof propertyName == 'number') {
        propertyName = `${path[0]} has element ${path[1]}`;
      }
    }

    message = message.replace(/["\\]/g, '');
    const cleanedMessage = message.charAt(0).toLowerCase() + message.slice(1);
    return {
      message:
        propertyName === ''
          ? cleanedMessage.trim()
          : `${propertyName} ${cleanedMessage}`,
    };
  });

  return {
    ok: false,
    error: {
      code: 1000,
      message: 'Invalid argument',
      details: minimalErrors.map((error) => error.message),
    },
  };
}
