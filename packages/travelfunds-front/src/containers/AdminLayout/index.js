import React from 'react'
import { observable, action } from 'mobx'
import { observer } from 'mobx-react'
import { Link } from 'react-router-dom'
import cn from 'classnames'

import { withStyles } from '@material-ui/core/styles'
import AppBar from '@material-ui/core/AppBar'
import Toolbar from '@material-ui/core/Toolbar'
import IconButton from '@material-ui/core/IconButton'
import Icon from '@material-ui/core/Icon'
import Typography from '@material-ui/core/Typography'
import Drawer from '@material-ui/core/Drawer'
import Button from '@material-ui/core/Button'
import List from '@material-ui/core/List'
import ListItem from '@material-ui/core/ListItem'
import ListItemIcon from '@material-ui/core/ListItemIcon'
import ListItemText from '@material-ui/core/ListItemText'

// Adapted from clipped and mini drawer example
// https://material-ui.com/demos/drawers/#drawer

const styles = theme => ({
  root: {
    display: 'flex'
  },
  appBar: {
    position: 'absolute',
    zIndex: theme.zIndex.drawer + 1,
    transition: theme.transitions.create(['width', 'margin'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen
    })
  },
  menuButton: {
    marginLeft: 12,
    marginRight: 36
  },
  drawerPaper: {
    position: 'relative',
    whiteSpace: 'nowrap',
    width: 240,
    transition: theme.transitions.create('width', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen
    })
  },
  drawerPaperClose: {
    overflowX: 'hidden',
    transition: theme.transitions.create('width', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen
    }),
    width: theme.spacing.unit * 9
  },
  toolbar: theme.mixins.toolbar,
  title: {
    flexGrow: 1
  },
  content: {
    flexGrow: 1,
    backgroundColor: theme.palette.background.default,
    padding: theme.spacing.unit * 3
  },
  listItem: {
    padding: 0
  },
  listItemText: {
    paddingLeft: '8px'
  },
  link: {
    display: 'flex',
    textDecoration: 'none',
    padding: '12px 24px',
    width: '100%'
  }
})

@observer
class AdminLayout extends React.Component {
  @observable open = window.localStorage
    ? window.localStorage.getItem('menu-collapsed') === 'false'
    : true

  @action toggle () {
    this.open = !this.open

    if (window.localStorage) {
      window.localStorage.setItem('menu-collapsed', !this.open)
    }
  }

  render () {
    const { classes, children } = this.props
    return <div className={classes.root}>
      <AppBar className={cn(classes.appBar, this.open && classes.appBarShift)}>
        <Toolbar disableGutters>
          <IconButton
            color='inherit'
            aria-label='menu'
            onClick={() => this.toggle()}
            className={classes.menuButton}>
            <Icon>menu</Icon>
          </IconButton>
          <Typography color='inherit' variant='title' className={classes.title}>
            Travel Funds Admin
          </Typography>
          <Button color='inherit' component={props =>
            <Link to='/logout' {...props} />}>
            Logout
          </Button>
        </Toolbar>
      </AppBar>
      <Drawer
        variant='permanent'
        classes={{ paper: cn(classes.drawerPaper, !this.open && classes.drawerPaperClose) }}>
        <div className={classes.toolbar} />
        <List>
          <ListItem button className={classes.listItem}>
            <Link to='/admin/trips' className={classes.link}>
              <ListItemIcon>
                <Icon>card_travel</Icon>
              </ListItemIcon>
              <ListItemText
                primary='Travel Requests'
                className={classes.listItemText}
              />
            </Link>
          </ListItem>
        </List>
      </Drawer>
      <main className={classes.content}>
        <div className={classes.toolbar} />
        {children}
      </main>
    </div>
  }
}

export default withStyles(styles, { withTheme: true })(AdminLayout)