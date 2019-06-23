import React, { useEffect, useRef, useState } from 'react'
import useInterval from '@use-it/interval'
import $ from 'jquery'
import 'sorry-status-bar/src/javascripts/status-bar.js'

export default ({
  componentIds = [],
  dismissable = true,
  pageId,
  refreshInterval = 5000
}) => {
  const el = useRef()
  const [styleSet, setStyleSet] = useState(false)

  const fetchStatus = () => {
    const $el = $(el.current)
    $el.statusBar({
      dismissable,
      filterType: componentIds,
      statusBarFor: pageId
    })
    // HACK: Mock out this function to rewrite the url properly
    $el.data('statusBar').getpath = function () {
      return 'https://code.sorryapp.com/status-bar/4.4.6/'
    }

    // Needed to prevent styles from getting appended forever
    const oldSetStyle = $el.data('statusBar').set_style
    $el.data('statusBar').set_style = function (brand) {
      if (!styleSet) {
        oldSetStyle.call($el.data('statusBar'), brand)
        setStyleSet(true)
      }
    }

    // The native Jquery adds all new elements ever render, so we need to remove before adding
    // the new ones
    const oldRender = $el.data('statusBar').render
    $el.data('statusBar').render = function (notices) {
      $el.empty()
      oldRender.call($el.data('statusBar'), notices)
    }
    $el.data('statusBar').init()
  }

  useEffect(fetchStatus)
  useInterval(fetchStatus, refreshInterval)

  return <div ref={el} className='sorry-status-bar' />
}
