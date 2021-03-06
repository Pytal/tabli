import * as log from 'loglevel'
import * as React from 'react'
import { mkUrl } from './util'
import * as actions from '../actions'
import * as Constants from './constants'
import { ThemeContext } from './themeContext'

import { cx, css } from 'emotion'
import * as styles from './cssStyles'

import HeaderButton from './HeaderButton'
import ExpanderButton from './ExpanderButton'
import HeaderCheckbox from './HeaderCheckbox'

const titleInputStyle = cx(styles.text, styles.noWrap, styles.windowTitleInput)

const revertButtonBaseStyle = css({
  maskImage: mkUrl('images/chevron-double-mix-1-01.png'),
  backgroundColor: '#7472ff',
  marginRight: '20px'
})
const revertButtonStyle = cx(styles.headerButton, revertButtonBaseStyle)

const editButtonBaseStyle = (theme: Object) => css`
  -webkit-mask-image: url('../images/Edition-30.png');
  background-color: ${theme.headerButtonColor};
  margin-left: 4px;
  margin-right: 12px;
  &:hover {
    background-color: ${theme.headerButtonHover};
  }
`

class WindowHeader extends React.PureComponent {
  static contextType = ThemeContext

  state = {
    editingTitle: false
  }

  handleUnmanageClick = (event) => {
    log.log('unamange: ', this.props.tabWindow)
    event.preventDefault()
    const archiveFolderId = this.props.winStore.archiveFolderId
    actions.unmanageWindow(archiveFolderId, this.props.tabWindow, this.props.storeRef)
    event.stopPropagation()
  };

  handleManageClick = (event) => {
    log.log('manage: ', this.props.tabWindow)
    event.preventDefault()
    var tabWindow = this.props.tabWindow
    var appComponent = this.props.appComponent
    appComponent.openSaveModal(tabWindow)

    event.stopPropagation()
  };

  handleTitleRename = (event) => {
    event.preventDefault()
    this.setState({ editingTitle: true })
    event.stopPropagation()
  }

  handleTitleSubmit = (event) => {
    event.preventDefault()
    this.setState({ editingTitle: false })
    const ic = this.titleInput
    if (ic) {
      const titleStr = ic.value
      if (titleStr !== this.props.tabWindow.title) {
        actions.setWindowTitle(titleStr, this.props.tabWindow, this.props.storeRef)
      }
    }
    event.stopPropagation()
  }

  handleTitleKeyDown = (e) => {
    if (e.keyCode === Constants.KEY_ESC) {
      // ESC key
      e.preventDefault()
      this.setState({ editingTitle: false })
    }
  };

  render () {
    let theme = this.context
    var tabWindow = this.props.tabWindow

    var managed = tabWindow.saved
    var windowTitle = tabWindow.title

    const checkTitle = managed ? 'Stop managing this window' : 'Save all tabs in this window'
    const checkOnClick = managed ? this.handleUnmanageClick : this.handleManageClick
    const checkItem = (
      <HeaderCheckbox
        title={checkTitle}
        onClick={checkOnClick}
        value={managed}
      />)

    const revertButton = (
      <HeaderButton
        className={revertButtonStyle}
        visible={managed && tabWindow.open}
        title='Revert to bookmarked tabs (Close other tabs)'
        onClick={this.props.onRevert} />)

    const editButtonStyle = cx(styles.headerButton, styles.headerHoverVisible, editButtonBaseStyle(theme))

    const editButton = (
      <HeaderButton
        className={editButtonStyle}
        visible={managed && !this.state.edititingTitle}
        title='Edit saved window title'
        onClick={this.handleTitleRename} />)

    var closeButton = (
      <HeaderButton
        className={styles.headerCloseButton(theme)}
        visible={tabWindow.open}
        title='Close Window'
        onClick={this.props.onClose} />)

    // log.log("WindowHeader: ", windowTitle, openStyle, managed, this.props.expanded)
    let titleComponent = null
    if (this.state.editingTitle) {
      titleComponent = (
        <form onSubmit={this.handleTitleSubmit}>
          <input
            className={titleInputStyle}
            type='text'
            name='window-title'
            id='window-title'
            ref={(titleElem) => {
              this.titleInput = titleElem
              if (titleElem) {
                window.setTimeout(() => {
                  titleElem.setSelectionRange(0, windowTitle.length)
                }, 0)
              }
            }}
            autoFocus
            autoComplete='off'
            defaultValue={windowTitle}
            onKeyDown={this.handleTitleKeyDown}
            onClick={(e) => { e.stopPropagation() } }
          />
        </form>
      )
    } else {
      titleComponent = (
        <span>{windowTitle}</span>
      )
    }

    const titleStyle = tabWindow.open ? styles.titleOpen : styles.titleClosed(theme)
    const titleSpan = (
      <div className={titleStyle}>
        {titleComponent}
        {editButton}
      </div>
    )

    // Note explicit global css class name windowHeaderHoverContainer here
    // Due to limitation of nested class selectors with composition;
    // see https://emotion.sh/docs/nested for more info.
    return (
      <div
        className={cx(styles.windowHeader(theme), styles.noWrap) + ' windowHeaderHoverContainer'}
        onClick={this.props.onOpen}>
        <div className={styles.rowItemsFixedWidth}>
          {checkItem}
          <ExpanderButton
            winStore={this.props.winStore}
            expanded={this.props.expanded}
            onClick={this.props.onExpand} />
        </div>
        {titleSpan}
        <div className={styles.rowItemsFixedWidth}>
          {revertButton}
          {closeButton}
        </div>
      </div>
    )
  }

  componentDidMount () {
    var titleElem = this.titleInput
    if (!titleElem) {
      return
    }
    /* titleElem.val(this.props.initialTitle); */
    const titleLen = this.props.initialTitle.length
    if (titleElem) {
      window.setTimeout(() => {
        log.log('timer func')
        titleElem.setSelectionRange(0, titleLen)
      }, 0)
    } else {
      log.warn('SaveModal: no titleInput element')
    }
  }
}

export default WindowHeader
