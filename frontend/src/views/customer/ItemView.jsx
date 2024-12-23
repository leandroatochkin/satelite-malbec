import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';


import { capitalize, dropIn, returnDiscount, returnDiscountDate } from '../../utils/common_functions';

import { UIStore } from '../../utils/store';

import style from './ItemView.module.css';
import { host } from '../../utils/index';

import {Backdrop, ModalOneButton, QuantityPicker} from '../../utils/common_components';
import {Cross} from '../../utils/svg_icons';


const ItemView = ({ product, setCurrentOrder, setOpenBuyModal, setFixbackground }) => {
  const [value, setValue] = useState(1);
  const [pushingItem, setPushingItem] = useState({
    PD_cod_raz_soc: product.PD_cod_raz_soc,
    PD_cod_suc: product.PD_cod_suc,
    PD_cod_pro:product.PD_cod_pro,
    PD_des_pro:product.PD_des_pro,
    PD_cod_rub:product.PD_cod_rub,
    PD_pre_ven: product.PD_est === 'X' || 'S' ? returnDiscount(product.PD_pre_ven, product.PD_discount) / 10000 : product.PD_pre_ven/10000,
    PD_ubi_imagen:product.PD_ubi_imagen,
    PD_est:product.PD_est,
    quantity: 1,
  });

  const language = UIStore((state)=>state.language)

  const superOffer =  product.PD_est === 'S' ? true : false

  const [openMsg, setOpenMsg] = useState(false);

  useEffect(() => {
    setPushingItem((prevItem) => ({
      ...prevItem,
      quantity: value,
    }));
  }, [value]);

  const handleClose = () => {
    setOpenBuyModal(false);
    setFixbackground(false)
  };

  const handleBuyBtn = (product) => {
    if (product) {
      setCurrentOrder((prevItems) => {
        // Check if the item is already in the cart
        const existingItemIndex = prevItems.findIndex(item => item.PD_cod_pro === pushingItem.PD_cod_pro);
  
        if (existingItemIndex !== -1) {
          // Item exists, so update the quantity
          const updatedItems = [...prevItems];
          updatedItems[existingItemIndex].quantity += pushingItem.quantity;
          return updatedItems;
        } else {
          // Item does not exist, so add it to the cart
          return [...prevItems, pushingItem];
        }
      });
  
      setOpenMsg(true); // Show confirmation message
    }
  };
  
  const date = returnDiscountDate(product.PD_discount_DATE)

  return (
    <Backdrop
    >
      <motion.div
        className={style.itemView}
        variants={dropIn}
        initial="hidden"
        animate="visible"
        exit="exit"
      >
        {
          !superOffer ? <div className={style.modalItemInfo}>
          <p className={product.PD_est === 'S' ? style.discountTag : style.hidden}><span style={{fontWeight: 'bolder'}}>{language.general_ui_text.highlighted_discount}</span>{' '}{language.general_ui_text.to}{' '}{date}</p>
          <div className={style.closeButtonContainer}>
          <motion.button
              className={style.closeFormButton}
              onClick={()=>{
                setFixbackground(false) 
                setOpenBuyModal(false)}
              }
              initial={{ scale: '1' }}
              whileTap={{ scale: '0.95' }}
              style={superOffer ? {color: '#e0e0e0'} : {color: '#212427'}}
              aria-label="Close book details"
            >
              <Cross />
            </motion.button>
           
          
          </div>
          <h1 className={style.dialogueTitle} aria-label={`Title: ${product.PD_des_pro}`} style={product.PD_est === 'S'  ? {color: '#e0e0e0'} : {color: '#212427'}}>
              {capitalize(product.PD_des_pro)}
            </h1>
          <div className={style.descriptionContainer}>
          <img src={`${host}/images/${product.PD_ubi_imagen}`} className={style.listImage}/>  
          <p className={superOffer ? style.itemModalDescriptionS : style.itemModalDescription} aria-label={`Description: ${product.PD_des_pro}`}>
          {capitalize(product.PD_des_pro)}
          </p>
          </div>
          <p className={ superOffer ? style.totalP : ''}>
            <span style={{ fontWeight: 'bolder' }}>{language.general_ui_text.price}:</span> {'$' + product.PD_pre_ven / 10000  }          
          </p>
          <p>
            <span style={{ fontWeight: 'bolder' }}>{language.general_ui_text.quantity}:</span>
          </p>
          <div className="operation-btn-container">
            <div className={style.pickerContainer}>
              <QuantityPicker min={1} max={10} value={value} setValue={setValue} product={product} aria-label="Select quantity" />
            </div>
            <motion.button
              className={style.addToCartBtn}
              initial={{ scale: '1' }}
              whileTap={{ scale: '0.95' }}
              onClick={() => {
                setFixbackground(false)
                handleBuyBtn(product)}}
            >
             {language.button_text.add_to_cart} 
            </motion.button>
          </div>
        </div> :

        /*-------------------------------super discount-------------------------------------*/
        <>
        <div className={style.topContainer} style={{backgroundImage: `url(${host}/images/${product.PD_img_discount}`}}>
          
        <motion.button
              className={style.closeFormButtonAlt}
              onClick={()=>{
                setFixbackground(false) 
                setOpenBuyModal(false)}
              }
              initial={{ scale: '1' }}
              whileTap={{ scale: '0.95' }}
              style={superOffer ? {color: '#e0e0e0'} : {color: '#212427'}}
              aria-label="Close book details"
            >
<Cross />

            </motion.button>
          </div> 
          <div className={style.infoContainer}>
          <div className={style.dialogueTitleAlt} aria-label={`Title: ${product.PD_des_pro}`}>
              {capitalize(product.PD_des_pro)}
            </div>

            <div className={ superOffer ? style.totalPalt : ''}>
            <p><span style={{textDecoration: 'line-through'}}>{'$'}{product.PD_pre_ven / 10000}</span> {'$'}{`${returnDiscount(product.PD_pre_ven, product.PD_discount) / 10000}`}</p>            
          </div>
          <div className={style.pickerContainer}>
              <QuantityPicker min={1} max={10} value={value} setValue={setValue} product={product} aria-label="Select quantity" />
            </div>
            <motion.button
              className={style.addToCartBtn}
              initial={{ scale: '1' }}
              whileTap={{ scale: '0.95' }}
              onClick={() => {
                setFixbackground(false)
                handleBuyBtn(product)}}

            >
             {language.button_text.add_to_cart} 
            </motion.button>    
          </div>
        </>
        }
      </motion.div>
      {openMsg && <ModalOneButton message={'Artículo añadido al carrito'} setFunction={setOpenBuyModal} buttonText={'Ok'}/>}
    
    </Backdrop>
  );
};

export default ItemView;
