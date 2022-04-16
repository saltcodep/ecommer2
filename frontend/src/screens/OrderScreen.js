import { Axios } from 'axios';
import React, { useContext, useEffect, useReducer } from 'react'
import { Helmet } from 'react-helmet-async';
import { Link, useNavigate, useParams } from 'react-router-dom';
import LoadingBox from '../components/LoadingBox'
import MessageBox from '../components/MessageBox'
import { Store } from '../Store';
import { getError } from '../utils';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Card from 'react-bootstrap/Card';
import ListGroup from 'react-bootstrap/ListGroup';

function reducer(state, action){
    switch(action.type){
        case 'CREATE_REQUEST':
            return {...state, loading: true, error: ''};
        case 'CREATE_SUCCESS':
            return {...state, loading: false, order: action.payload, error:''};
        case 'CREATE_FAIL':
            return {...state, loading: false, error: action.payload};
        default:
            return state;
    }
}

export default function OrderScreen() {
    const navigate = useNavigate();
    const {state} = useContext(Store);
    const params = useParams();
    const { id: orderId } = params;
    const {userInfo} = state;
    const [{loading, error, order}, dispatch] = useReducer(reducer,{
        loading: true,
        order: {},
        error: ''
    });
    useEffect(() => {
        const fetchOrder = async () =>{
            try{
            dispatch({type: 'FETCH_REQUEST'});
            const {data} = await Axios.get(`/api/orders/${orderId}`,{
                headers: {authorization: `Bearer ${userInfo.token}`},
            });
            dispatch({type: 'FETCH_SUCCESS', payload: data});
            }catch(err){
            dispatch({type: 'FETCH_FAIL', payload: getError(err)});
            }
        }
        if(!userInfo){
            return navigate('/login');
        }
        if(!order || (order._id && order._id !== orderId)){
            fetchOrder();
        }
    }, [navigate, userInfo, orderId, order]);

  return (
    loading ? (<LoadingBox></LoadingBox>)
    :
    error ? (<MessageBox variant='danger'>{error}</MessageBox>)
    :
    <div>
        <Helmet>
            <title>Order {orderId}</title>
        </Helmet>
        <h1 className='my-3'>Order {orderId}</h1>
        <Row>
            <Col mb={8}>
                <Card className='mb-3'>
                    <Card.Boby>
                        <Card.Title>Shipping</Card.Title>
                        <Card.Text>
                            <strong>Name:</strong> {order.shippingAddress.fullName} <br />
                            <strong>Address:</strong> {order.shippingAddress.address},
                            {order.shippingAddress.city}, {order.shippingAddress.postalCode}
                            ,{order.shippingAddress.country}
                        </Card.Text>
                        {order.isDelivered ? (
                                <MessageBox variant='success'>
                                    Delivered at {order.deliveredAt}
                                </MessageBox>
                            ):(
                                <MessageBox variant='danger'>
                                    Not Delivared
                                </MessageBox>
                            )
                        }
                    </Card.Boby>
                </Card>
                <Card className='mb-3'>
                    <Card.Boby>
                        <Card.Title>Payment</Card.Title>
                        <Card.Text>
                            <strong>Method:</strong> {order.paymentMethod}
                        </Card.Text>
                        {order.isDelivered ? (
                                <MessageBox variant='success'>
                                    Paid at {order.deliveredAt}
                                </MessageBox>
                            ):(
                                <MessageBox variant='danger'>
                                    Not Paid
                                </MessageBox>
                            )
                        }
                    </Card.Boby>
                </Card>
                <Card className='mb-3'>
                    <Card.Boby>
                        <Card.Title>Item</Card.Title>
                        <ListGroup variant="flush">
                            {order.orderItem.map((item) => (
                                <ListGroup.Item key={item._id}>
                                    <Row className='align-item-center'>
                                        <Col mb={6}>
                                            <img src={item.image} alt={item.name} className='img-fluid rounded img-thumbnail'></img>{' '}
                                            <Link to={`/product/${item.slug}`}>{item.name}</Link>
                                        </Col>
                                        <Col md={3}><span>{item.quantity}</span></Col>
                                        <Col md={3}>${item.price}</Col>
                                    </Row>
                                </ListGroup.Item>
                            ))}
                        </ListGroup>
                    </Card.Boby>
                </Card>
            </Col>
            <Col md={4}>
                <Card>
                    <Card.Body>
                        <Card.Title>Order Summary</Card.Title>
                        <ListGroup variant='flush'>
                            <ListGroup.Item>
                                <Row>
                                    <Col>Items</Col>
                                    <Col>${order.itemPrice.toFixed(2)}</Col>
                                </Row>
                            </ListGroup.Item>
                            <ListGroup.Item>
                                <Row>
                                    <Col>Tax</Col>
                                    <Col>${order.taxPrice.toFixed}</Col>
                                </Row>
                            </ListGroup.Item>
                            <ListGroup.Item>
                                <Row>
                                    <Col>
                                        <strong>Order Total</strong>
                                    </Col>
                                    <Col>
                                        <strong>${order.totalPrice.toFixed(2)}</strong>
                                    </Col>
                                </Row>
                            </ListGroup.Item>
                        </ListGroup>
                    </Card.Body>
                </Card>
            </Col>
        </Row>
    </div>
  )
}
