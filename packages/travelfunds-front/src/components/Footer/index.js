import React from 'react'
import styles from './styles.scss'
import squaredLabsStamp from '../../../assets/img/squared-labs-stamp.svg'

export default () => (
  <div className={styles.container}>
    <p>&copy; <a target='_blank' rel='noopener noreferrer' href='https://uconn.edu/'>University of Connecticut</a></p>
    <p><a target='_blank' rel='noopener noreferrer' href='http://research.uconn.edu'>Office of the Vice President for Research</a></p>
    <a target='_blank' rel='noopener noreferrer' href='https://squaredlabs.uconn.edu'><img alt='Designed and Developed by Squared Labs' src={squaredLabsStamp} /></a>
  </div>
)
