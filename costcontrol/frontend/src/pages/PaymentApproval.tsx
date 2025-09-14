import { useState, useEffect } from 'react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Textarea } from '../components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Label } from '../components/ui/label';
import { Input } from '../components/ui/input';
import { useToast } from '../hooks/use-toast';
import apiClient from '../lib/axiosConfig';

interface Payment {
  id: number;
  fecha: string;
  proveedor: string;
  concepto: string;
  monto: number;
  status: string;
  comentarios?: string;
  metodoPago?: string;
  referencia?: string;
}

export default function PaymentApproval() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<number | null>(null);
  const [comments, setComments] = useState('');
  const [dueDate, setDueDate] = useState('');
  const { toast } = useToast();

  const loadPendingPayments = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/pagos/pending');
      const data = response.data;
      
      if (Array.isArray(data)) {
        setPayments(data);
      }
    } catch (error) {
      console.error('Error fetching pending payments:', error);
      toast({
        title: 'Error',
        description: 'Error al cargar los pagos pendientes',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPendingPayments();
  }, []);

  const approvePayment = async (paymentId: number) => {
    try {
      setProcessing(paymentId);
      const response = await apiClient.post(`/pagos/${paymentId}/approve`, {
        approvedBy: 'current-user' // TODO: Get from auth context
      });

      const data = response.data;
      if (data.success) {
        toast({
          title: 'Éxito',
          description: 'Pago aprobado correctamente',
        });
        loadPendingPayments(); // Refresh the list
      }
    } catch (error) {
      console.error('Error approving payment:', error);
      toast({
        title: 'Error',
        description: 'Error al aprobar el pago',
        variant: 'destructive',
      });
    } finally {
      setProcessing(null);
    }
  };

  const deferPayment = async (paymentId: number) => {
    try {
      setProcessing(paymentId);
      const response = await apiClient.post(`/pagos/${paymentId}/defer`, {
        deferredBy: 'current-user', // TODO: Get from auth context
        reason: 'Deferred via approval interface'
      });

      const data = response.data;
      if (data.success) {
        toast({
          title: 'Éxito',
          description: 'Pago diferido correctamente',
        });
        loadPendingPayments(); // Refresh the list
      }
    } catch (error) {
      console.error('Error deferring payment:', error);
      toast({
        title: 'Error',
        description: 'Error al diferir el pago',
        variant: 'destructive',
      });
    } finally {
      setProcessing(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES');
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
    }).format(amount);
  };

  // Traducir estado del pago
  const translateStatus = (status: string) => {
    const statusMap: { [key: string]: string } = {
      'pending': 'Pendiente',
      'approved': 'Aprobado',
      'deferred': 'Diferido',
      'rejected': 'Rechazado'
    };
    return statusMap[status] || 'Sin estado';
  };

  if (loading) {
    return <div className="p-6">Cargando pagos pendientes...</div>;
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Aprobación de Pagos</h1>
      
      {payments.length === 0 ? (
        <Card>
          <CardContent className="p-6">
            <p className="text-center text-gray-500">No hay pagos pendientes para aprobar</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {payments.map((payment) => (
            <Card key={payment.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{payment.proveedor}</CardTitle>
                    <p className="text-sm text-gray-600">{payment.concepto}</p>
                  </div>
                  <Badge>{translateStatus(payment.status)}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-sm font-medium">Fecha:</p>
                    <p className="text-sm">{formatDate(payment.fecha)}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Monto:</p>
                    <p className="text-sm font-bold">{formatAmount(payment.monto)}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Método de pago:</p>
                    <p className="text-sm">{payment.metodoPago || 'No especificado'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Referencia:</p>
                    <p className="text-sm">{payment.referencia || 'No especificado'}</p>
                  </div>
                </div>
                
                {payment.comentarios && (
                  <div className="mb-4">
                    <p className="text-sm font-medium">Comentarios:</p>
                    <p className="text-sm">{payment.comentarios}</p>
                  </div>
                )}

                <div className="flex space-x-2">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button 
                        onClick={() => approvePayment(payment.id)}
                        disabled={processing === payment.id}
                        className="bg-green-600 hover:bg-green-700 text-white"
                      >
                        {processing === payment.id ? 'Procesando...' : 'Aprobar'}
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Aprobar Pago</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="comments">Comentarios (opcional)</Label>
                          <Textarea
                            id="comments"
                            placeholder="Comentarios de aprobación..."
                            value={comments}
                            onChange={(e) => setComments(e.target.value)}
                          />
                        </div>
                        <div className="flex space-x-2">
                          <Button 
                            onClick={() => approvePayment(payment.id)}
                            className="flex-1"
                          >
                            Confirmar Aprobación
                          </Button>
                          <Button 
                            onClick={() => {
                              setComments('');
                            }}
                            className="flex-1"
                          >
                            Cancelar
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>

                  <Dialog>
                    <DialogTrigger asChild>
                      <Button 
                        onClick={() => deferPayment(payment.id)}
                        disabled={processing === payment.id}
                        variant="outline"
                        className="border-orange-300 text-orange-600 hover:bg-orange-50"
                      >
                        {processing === payment.id ? 'Procesando...' : 'Diferir'}
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Diferir Pago</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="dueDate">Fecha de vencimiento (opcional)</Label>
                          <Input
                            id="dueDate"
                            type="date"
                            value={dueDate}
                            onChange={(e) => setDueDate(e.target.value)}
                          />
                          <p className="text-xs text-gray-500 mt-1">
                            Si no se especifica, se asignará 30 días desde hoy
                          </p>
                        </div>
                        <div>
                          <Label htmlFor="comments">Comentarios (opcional)</Label>
                          <Textarea
                            id="comments"
                            placeholder="Razón del diferimiento..."
                            value={comments}
                            onChange={(e) => setComments(e.target.value)}
                          />
                        </div>
                        <div className="flex space-x-2">
                          <Button 
                            onClick={() => deferPayment(payment.id)}
                            className="flex-1"
                          >
                            Confirmar Diferimiento
                          </Button>
                          <Button 
                            onClick={() => {
                              setComments('');
                              setDueDate('');
                            }}
                            className="flex-1"
                          >
                            Cancelar
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
} 