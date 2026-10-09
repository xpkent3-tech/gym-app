import { useState } from 'react';

import { Body, Button, Card, Row } from '@/components/ui';

/** Two-step destructive button: first tap reveals an inline confirmation (works identically on web and native). */
export function ConfirmButton({ title, message, confirmTitle, onConfirm, testID }: { title: string; message: string; confirmTitle: string; onConfirm: () => void; testID: string }) {
  const [asking, setAsking] = useState(false);
  if (!asking) return <Button title={title} variant="danger" onPress={() => setAsking(true)} testID={testID} />;
  return (
    <Card>
      <Body>{message}</Body>
      <Row style={{ gap: 8 }}>
        <Button title="Cancel" variant="secondary" onPress={() => setAsking(false)} style={{ flex: 1 }} testID={`${testID}-cancel`} />
        <Button title={confirmTitle} variant="danger" onPress={onConfirm} style={{ flex: 1 }} testID={`${testID}-confirm`} />
      </Row>
    </Card>
  );
}
