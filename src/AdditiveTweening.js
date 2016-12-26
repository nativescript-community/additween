/* globals window */
'use strict'

var now = require('./now')
var PlainObjectReducer = require('./PlainObjectReducer')


function noop() {}

function identity(t) {
    return t
}

function AdditiveTweening(options) {
	var frame = null,
		lastTargetState = null,
		currentState = null,
		animationStack = [],
		onRender = options.onRender || noop,
        stateReducer = options.stateReducer || PlainObjectReducer,
		onFinish = options.onFinish || noop,
		onCancel = options.onCancel || noop


    function filterOutdatedTargetsFromStack(time) {
        var filteredStack = []
        for (var i = animationStack.length - 1; i >= 0; i--) {
            if (animationStack[i].end > time) {
                filteredStack.push(animationStack[i])
            }
        }

        animationStack = filteredStack
    }

    function getCurrentState(time) {
        var animation,
            remain

        var target = stateReducer.clone(lastTargetState)

        for (var i = animationStack.length - 1; i >= 0; i--) {
            animation = animationStack[i]
            if (animation.end < time) {
                continue
            }
            remain = (animation.end - time) / animation.duration
            target = stateReducer.reduce(target, animation.toState, animation.fromState, animation.easing(remain))
        }

        return target
    }

    function hasActiveAnimation(time) {
        for (var i = animationStack.length - 1; i >= 0; i--) {
            var animation = animationStack[i]
            if (animation.end >= time) {
                return true
            }
        }
    }

    var animationStep = function _animationStep() {
        if (lastTargetState === null) {
            return
        }

        var time = this.now()

        currentState = getCurrentState(time)

        onRender(currentState)

        if (hasActiveAnimation(time)) {
            frame = this.scheduleAnimationFrame(animationStep)
        } else {
            this.finish()
        }
    }.bind(this)


    /**
     * Returns true if any tweening is in process
     * @returns {boolean}
     */
	this.isTweening = function() {
		return !!lastTargetState
	}

    /**
     * Immediately sets tweening to its final state.
     */
	this.finish = function() {
		if (lastTargetState !== null) {
			onFinish(lastTargetState)

			lastTargetState = null
			currentState = null
		}
	}

    /**
     * Cancels all active tweening processes
     */
	this.cancel = function() {
		if (lastTargetState !== null) {
			if (window.cancelAnimationFrame) {
				window.cancelAnimationFrame(frame)
				frame = null
			}
			onCancel()

			lastTargetState = null
			currentState = null
		}
	}

    /**
     * Starts new tweening process
     * @param fromState
     * @param toState
     * @param {Number} duration   Duration in ms
     * @param {Function} easing    An easing function. It should take a number from [0,1] range and return a number from [0,1] range.
     */
    this.tween = function(fromState, toState, duration, easing) {
        var time = this.now(),
            animation

        animation = {
            duration: duration,
            end: time + duration,
            fromState: lastTargetState === null ? fromState : lastTargetState,
            toState: toState,
            easing: easing || identity
        }

        filterOutdatedTargetsFromStack(time)

        animationStack.push(animation)

        lastTargetState = toState

        frame = this.scheduleAnimationFrame(animationStep)
    }
}

AdditiveTweening.prototype.scheduleAnimationFrame = function(cb) {
    return window.requestAnimationFrame(cb)
}

AdditiveTweening.prototype.now = function() {
    return now()
}


module.exports = AdditiveTweening
