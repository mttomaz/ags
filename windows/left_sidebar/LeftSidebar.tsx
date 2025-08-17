import { Astal } from "ags/gtk4"
import Gtk from "gi://Gtk?version=4.0"
import Gdk from "gi://Gdk?version=4.0"
import app from "ags/gtk4/app"
import { Accessor, With } from "ags"
import { getWeatherEmoji, getWeatherImage } from "@common/functions"
import { currentDay, weatherReport } from "@common/vars"
import Time from "@widgets/Time/Time"


function TimeAndDate() {
  return (
    <box
      class="TimeAndDate"
      orientation={Gtk.Orientation.VERTICAL}
    >
      <Time />
      <With value={currentDay}>
        {(day) => (
          <label
            class="Today"
            label={day.replace(/\^(\w)(\w*)/g, (_, first, rest) =>
              first.toUpperCase() + rest.toLowerCase())
            } />
        )}
      </With>
    </box>
  )
}

function CalendarModule() {
  return (
    <box class="calendar" orientation={Gtk.Orientation.VERTICAL}>
      <Gtk.Calendar />
    </box>
  )
}

function getUpcomingHours(hourly: any[]) {
  const now = new Date()
  const currentHour = now.getHours()

  const parsedHourly = hourly.map(h => ({
    ...h,
    hour: Math.floor(Number(h.time) / 100),
  }))

  const startIdx = parsedHourly.findIndex(h => h.hour > currentHour)

  const slice = parsedHourly.slice(startIdx, startIdx + 5)
  return slice.length === 5 ? slice : [...slice, ...parsedHourly.slice(0, 5 - slice.length)]
}


function WeatherSidebar() {
  return <box>
    <With value={weatherReport}>
      {(data) => {
        if (!data) return <box />

        if (data?.weather) {
          const current = data.weather.current_condition[0]
          const upcoming = getUpcomingHours(data.weather.weather[0].hourly)
          const image = getWeatherImage(current.weatherDesc[0].value)

          return <box
            class="Weather"
            orientation={Gtk.Orientation.VERTICAL}>
            <overlay vexpand hexpand>
              <image class="Image" file={`${SRC}/assets/weather/${image}`} />
              <box
                $type="overlay"
                class="Current">
                <box orientation={Gtk.Orientation.VERTICAL} halign={Gtk.Align.START}>
                  <label
                    class="Icon"
                    xalign={0}
                    yalign={0}
                    vexpand
                    label={getWeatherEmoji(current.weatherDesc[0].value)} />
                  <label
                    class="Description"
                    xalign={0}
                    label={current.weatherDesc[0].value} />
                </box>
                <box hexpand />
                <box orientation={Gtk.Orientation.VERTICAL} halign={Gtk.Align.END}>
                  <box orientation={Gtk.Orientation.VERTICAL}>
                    <label
                      class="Temp"
                      xalign={1}
                      yalign={0}
                      label={`${current.temp_C}°`} />
                    <label
                      class="FeelsLike"
                      xalign={1}
                      yalign={0}
                      vexpand
                      label={`Feels like: ${current.FeelsLikeC}°`} />
                  </box>
                  <box
                    class="Info"
                    orientation={Gtk.Orientation.VERTICAL}>
                    <label class="Wind" xalign={1} label={`${current.windspeedKmph}km 💨`} />
                    <label class="Humidity" xalign={1} label={`${current.humidity}% 💧`} />
                    <label class="Precipitation" xalign={1} label={`${current.precipMM}mm ☔`} />
                  </box>
                </box>
              </box>
            </overlay>
            <box
              class="HourlyForecast"
              homogeneous>
              {upcoming.map(h => (
                <box orientation={1} hexpand={true} class="HourlyItem" spacing={4}>
                  <label label={`${h.hour.toString().padStart(2, "0")}:00`} class="Hour" />
                  <label
                    label={getWeatherEmoji(h.weatherDesc[0].value)}
                    class="Icon"
                    tooltipText={`${h.weatherDesc[0].value}, ☔: ${h.precipMM}mm`}
                  />
                  <label label={`${h.tempC}°`} class="SmallTemp" />
                </box>
              ))}
            </box>
          </box>
        }
      }}
    </With>
  </box>
}


export default function LeftSidebar(monitor: Gdk.Monitor, visible: Accessor<boolean>) {
  const { LEFT, TOP } = Astal.WindowAnchor

  return <window
    class="LeftSidebar"
    namespace="leftsidebar"
    gdkmonitor={monitor}
    exclusivity={Astal.Exclusivity.EXCLUSIVE}
    application={app}
    layer={Astal.Layer.TOP}
    visible={visible}
    anchor={TOP | LEFT}>
    <box
      hexpand
      orientation={Gtk.Orientation.VERTICAL}
      class="sidebar"
    >
      <TimeAndDate />
      <CalendarModule />
      <WeatherSidebar />
    </box>
  </window>
}
